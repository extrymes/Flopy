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
        .setDescription(`${languages["en"].COMMAND_SEARCH_OPTION}`)
        .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_SEARCH_OPTION}` })
        .setRequired(true)
    ),
  run: async (client, interaction, guildData, queue, lang) => {
    const { member, options } = interaction;
    const query = options.getString("query");

    if (!client.handleCooldown("searchCommand", member.id, 4000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
    await interaction.deferReply({ ephemeral: true }).catch((error) => { });
    try {
      // Search for results
      const results = await client.distube.search(query);
      // Update response
      const response = await module.exports.updateResponse(interaction, lang, results, results[0]);
      selections[response.id] = results[0];
      // Create collector
      const collector = response.createMessageComponentCollector({ time: 120000 });
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
        // Update response
        await module.exports.updateResponse(interaction, lang, results, results[value]);
        selections[message.id] = results[value];
        subinteraction.deferUpdate().catch((error) => { });
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
        if (library.length >= config.LIBRARY_MAX_LENGTH) return client.sendErrorNotification(subinteraction, `${lang.ERROR_LIBRARY_LIMIT_REACHED}`);
        if (library.find((item) => item.url === selectedResult.url)) return client.sendErrorNotification(subinteraction, `${lang.ERROR_LIBRARY_SONG_ALREADY_ADDED}`);
        // Add item to library
        library.push({ name: selectedResult.name, author: selectedResult.uploader?.name, thumbnail: selectedResult.thumbnail, url: selectedResult.url, isPlaylist: false });
        await subinteraction.deferReply({ ephemeral: true }).catch((error) => { });
        try {
          // Update user data in database
          await client.updateUserData(member, { library: library });
          // Send advanced notification
          client.sendAdvancedNotification(subinteraction, `${lang.MESSAGE_LIBRARY_SONG_ADDED} (#${library.length})`, `${selectedResult.name}`, selectedResult.thumbnail, { editReply: true });
        } catch (error) {
          const errorMessage = client.getErrorMessage(error.message, lang);
          client.sendErrorNotification(subinteraction, `${errorMessage}`, { editReply: true });
        }
        break;
    }
  },
  updateResponse: async (interaction, lang, results, selectedResult) => {
    const options = results.map((song, i) => { return { label: `${i + 1}. ${song.name.length > config.SONG_NAME_MAX_LENGTH_DISPLAY ? song.name.substr(0, config.SONG_NAME_MAX_LENGTH_DISPLAY).concat("...") : song.name}`, description: `${song.uploader?.name || "-"}`, emoji: elements.EMOJI_SONG, value: `${i}`, default: song === selectedResult } });
    const searchEmbed = new EmbedBuilder().setAuthor({ name: `${lang.MESSAGE_SEARCH_TITLE}`, iconURL: elements.ICON_FLOPY }).addFields({ name: `**${lang.MESSAGE_SONG_TITLE}**`, value: `[${selectedResult.name}](${selectedResult.url})` }, { name: `**${lang.MESSAGE_SONG_AUTHOR}**`, value: `${selectedResult.uploader?.name || "-"}`, inline: true }, { name: `**${lang.MESSAGE_SONG_VIEWS}**`, value: `${selectedResult.views.toString().replace(/(.)(?=(\d{3})+$)/g, "$1,")}`, inline: true }, { name: `**${lang.MESSAGE_SONG_DURATION}**`, value: `${selectedResult.formattedDuration}`, inline: true }).setThumbnail(selectedResult.thumbnail).setColor(elements.COLOR_FLOPY);
    const searchMenu = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("select").setOptions(options));
    const searchButtons = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("play").setStyle(ButtonStyle.Primary).setLabel(`${lang.BUTTON_PLAY}`), new ButtonBuilder().setCustomId("add").setStyle(ButtonStyle.Success).setLabel(`${lang.BUTTON_LIBRARY_ADD_ITEM}`));
    const response = await interaction.editReply({ embeds: [searchEmbed], components: [searchMenu, searchButtons] });
    return response;
  }
}