const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../admin/config");
const elements = require("../utils/elements");
const languages = require("../utils/languages");
const selections = {};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription(`${languages["en"].COMMAND_SEARCH_DESCRIPTION}`)
    .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_SEARCH_DESCRIPTION}` })
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription(`${languages["en"].COMMAND_SEARCH_OPTION_QUERY}`)
        .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_SEARCH_OPTION_QUERY}` })
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription(`${languages["en"].COMMAND_SEARCH_OPTION_TYPE}`)
        .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_SEARCH_OPTION_TYPE}` })
        .setChoices(
          { name: `${languages["en"].COMMAND_SEARCH_OPTION_TYPE_CHOICE_SONG}`, name_localizations: { "fr": `${languages["fr"].COMMAND_SEARCH_OPTION_TYPE_CHOICE_SONG}` }, value: "video" },
          { name: `${languages["en"].COMMAND_SEARCH_OPTION_TYPE_CHOICE_PLAYLIST}`, name_localizations: { "fr": `${languages["fr"].COMMAND_SEARCH_OPTION_TYPE_CHOICE_PLAYLIST}` }, value: "playlist" }
        )
        .setRequired(false)
    ),
  run: async (client, interaction, guildData, queue, lang) => {
    const { member, options } = interaction;
    const query = options.getString("query");
    const type = options.getString("type") || "video";

    if (!client.handleCooldown("searchCommand", member.id, 4000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
    await interaction.deferReply({ ephemeral: true }).catch((error) => { });
    try {
      // Search for results using query and type
      const results = await client.distube.search(query, { limit: config.DISTUBE_SEARCH_MAX_RESULTS, type: type });
      // Update response
      await module.exports.updateResponse(interaction, lang, results, results[0]);
      const response = await interaction.fetchReply();
      selections[response.id] = results[0];
      // Create collector
      const collector = response.createMessageComponentCollector({ time: config.SUBINTERACTION_COLLECTOR_TIMEOUT * 1000 });
      // Collect subinteractions
      collector.on("collect", async (subinteraction) => module.exports.subrun(client, interaction, subinteraction, results));
      collector.on("end", (collected) => {
        interaction.deleteReply().catch((error) => { });
        delete selections[response.id];
      });
    } catch (error) {
      const errorMessage = client.getErrorMessage(error.message, lang);
      client.sendErrorNotification(interaction, `${errorMessage}`, { editReply: true });
    }
  },
  subrun: async (client, interaction, subinteraction, results) => {
    const { guild, channel, message, member } = subinteraction;
    const guildData = await client.getGuildData(guild);
    const queue = client.distube.getQueue(guild);
    const lang = languages[guildData.language];
    const selectedResult = selections[message.id];

    switch (subinteraction.customId) {
      case "select":
        const value = Number(subinteraction.values[0]);
        try {
          // Update response
          await module.exports.updateResponse(interaction, lang, results, results[value]);
          selections[message.id] = results[value];
          subinteraction.deferUpdate().catch((error) => { });
        } catch (error) {
          const errorMessage = client.getErrorMessage(error.message, lang);
          client.sendErrorNotification(subinteraction, `${errorMessage}`);
        }
        break;
      case "play":
        if (!member.voice.channel) return client.sendErrorNotification(subinteraction, `${lang.ERROR_MEMBER_MUST_JOIN_VOICE_CHANNEL}`);
        if (!client.checkMemberIsInMyVoiceChannel(guild, member) && queue) return client.sendErrorNotification(subinteraction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
        if (!client.handleCooldown("playQuery", member.id, 2000)) return client.sendErrorNotification(subinteraction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
        await subinteraction.deferReply().catch((error) => { });
        try {
          // Play or add item to the queue using selected song
          await client.distube.play(member.voice.channel, selectedResult, { textChannel: channel, member: member, metadata: subinteraction });
        } catch (error) {
          const errorMessage = client.getErrorMessage(error.message, lang);
          client.sendErrorNotification(subinteraction, `${errorMessage}`, { editReply: true });
        }
        break;
      case "add":
        const userData = await client.getUserData(member);
        const library = userData.library;
        const isPlaylist = selectedResult.type === "playlist";
        if (library.find((item) => item.url === selectedResult.url)) return client.sendErrorNotification(subinteraction, `${isPlaylist ? lang.ERROR_LIBRARY_PLAYLIST_ALREADY_ADDED : lang.ERROR_LIBRARY_SONG_ALREADY_ADDED}`);
        if (library.length >= config.LIBRARY_MAX_LENGTH) return client.sendErrorNotification(subinteraction, `${lang.ERROR_LIBRARY_LIMIT_REACHED}`);
        // Add item to library
        library.push({ name: selectedResult.name, author: selectedResult.uploader?.name, thumbnail: selectedResult.thumbnail, url: selectedResult.url, isPlaylist: isPlaylist });
        await subinteraction.deferReply({ ephemeral: true }).catch((error) => { });
        try {
          // Update user data in database
          await client.updateUserData(member, { library: library });
          // Send advanced notification
          client.sendAdvancedNotification(subinteraction, `${isPlaylist ? lang.MESSAGE_LIBRARY_PLAYLIST_ADDED : lang.MESSAGE_LIBRARY_SONG_ADDED} (#${library.length})`, `${selectedResult.name}`, selectedResult.thumbnail, { editReply: true });
        } catch (error) {
          const errorMessage = client.getErrorMessage(error.message, lang);
          client.sendErrorNotification(subinteraction, `${errorMessage}`, { editReply: true });
        }
        break;
    }
  },
  updateResponse: async (interaction, lang, results, selectedResult) => {
    // Update search embed, menu and buttons
    const isPlaylist = selectedResult.type === "playlist";
    const emoji = isPlaylist ? elements.EMOJI_PLAYLIST : elements.EMOJI_SONG;
    const options = results.map((result, i) => { return { label: `${i + 1}. ${result.name.length > config.ITEM_NAME_MAX_LENGTH_DISPLAY ? result.name.substr(0, config.ITEM_NAME_MAX_LENGTH_DISPLAY).concat("...") : result.name}`, description: `${result.uploader?.name || "-"}`, emoji: emoji, value: `${i}`, default: result === selectedResult } });
    const searchEmbed = new EmbedBuilder().setAuthor({ name: `${lang.MESSAGE_SEARCH_TITLE} (${results.length})`, iconURL: elements.ICON_FLOPY }).addFields({ name: `**${lang.MESSAGE_ITEM_TITLE}**`, value: `[${selectedResult.name}](${selectedResult.url})` }, { name: `**${lang.MESSAGE_ITEM_AUTHOR}**`, value: `${selectedResult.uploader?.name || "-"}`, inline: true }, isPlaylist ? { name: `**${lang.MESSAGE_ITEM_LENGTH}**`, value: `${selectedResult.length} ${lang.MESSAGE_ITEM_LENGTH_SONGS}`, inline: true } : { name: `**${lang.MESSAGE_ITEM_VIEWS}**`, value: `${selectedResult.views.toString().replace(/(.)(?=(\d{3})+$)/g, "$1,")}`, inline: true }, { name: `**${lang.MESSAGE_ITEM_DURATION}**`, value: `${selectedResult.formattedDuration || "-"}`, inline: true }).setThumbnail(selectedResult.thumbnail).setColor(elements.COLOR_FLOPY);
    const searchMenu = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("select").setOptions(options));
    const searchButtons = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("play").setStyle(ButtonStyle.Primary).setLabel(`${lang.BUTTON_PLAY}`), new ButtonBuilder().setCustomId("add").setStyle(ButtonStyle.Success).setLabel(`${lang.BUTTON_LIBRARY_ADD}`));
    await interaction.editReply({ embeds: [searchEmbed], components: [searchMenu, searchButtons] });
  }
}