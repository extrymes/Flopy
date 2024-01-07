const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../admin/config");
const elements = require("../utils/elements");
const languages = require("../utils/languages");
const selections = {};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("library")
    .setDescription(`${languages["en"].COMMAND_LIBRARY_DESCRIPTION}`)
    .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_LIBRARY_DESCRIPTION}` })
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription(`${languages["en"].COMMAND_LIBRARY_VIEW_DESCRIPTION}`)
        .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_LIBRARY_VIEW_DESCRIPTION}` })
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription(`${languages["en"].COMMAND_LIBRARY_ADD_DESCRIPTION}`)
        .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_LIBRARY_ADD_DESCRIPTION}` })
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription(`${languages["en"].COMMAND_LIBRARY_REMOVE_DESCRIPTION}`)
        .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_LIBRARY_REMOVE_DESCRIPTION}` })
        .addIntegerOption(option =>
          option
            .setName("position")
            .setDescription(`${languages["en"].COMMAND_LIBRARY_REMOVE_OPTION}`)
            .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_LIBRARY_REMOVE_OPTION}` })
            .setRequired(true)
        )
    ),
  run: async (client, interaction, guildData, queue, lang) => {
    const { user, options } = interaction;
    const subcommand = options.getSubcommand();
    const userData = await client.getUserData(user);
    const library = userData.library;

    switch (subcommand) {
      case "view":
        if (library.length === 0) return client.sendErrorNotification(interaction, `${lang.ERROR_LIBRARY_NO_ITEM}`);
        if (!client.handleCooldown("libraryCommand", user.id, 4000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
        await interaction.deferReply({ ephemeral: true }).catch((error) => { });
        try {
          // Update response
          const response = await module.exports.updateResponse(interaction, lang, library, library[0]);
          selections[response.id] = library[0];
          // Create collector
          const collector = response.createMessageComponentCollector({ time: 120000 });
          // Collect subinteractions
          collector.on("collect", (subinteraction) => module.exports.subrun(client, interaction, subinteraction));
          collector.on("end", (collected) => {
            interaction.deleteReply().catch((error) => { });
            delete selections[response.id];
          });
        } catch (error) {
          const errorMessage = client.getErrorMessage(error.message, lang);
          client.sendErrorNotification(interaction, `${errorMessage}`, { editReply: true });
        }
        break;
      case "add":
        const playing = queue?.songs[0]?.playlist || queue?.songs[0];
        if (!playing) return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_NO_PLAYING}`);
        const isPlaylist = playing.url.includes("playlist");
        if (library.length >= config.LIBRARY_MAX_LENGTH) return client.sendErrorNotification(interaction, `${lang.ERROR_LIBRARY_LIMIT_REACHED}`);
        if (library.find((item) => item.url === playing.url)) return client.sendErrorNotification(interaction, `${isPlaylist ? lang.ERROR_LIBRARY_PLAYLIST_ALREADY_ADDED : lang.ERROR_LIBRARY_SONG_ALREADY_ADDED}`);
        // Add item to library
        library.push({ name: playing.name, author: playing.uploader?.name, thumbnail: playing.thumbnail, url: playing.url, isPlaylist: isPlaylist });
        await interaction.deferReply({ ephemeral: true }).catch((error) => { });
        try {
          // Update user data in database
          await client.updateUserData(user, { library: library });
          // Send advanced notification
          client.sendAdvancedNotification(interaction, `${isPlaylist ? lang.MESSAGE_LIBRARY_PLAYLIST_ADDED : lang.MESSAGE_LIBRARY_SONG_ADDED} (#${library.length})`, `${playing.name}`, playing.thumbnail, { editReply: true });
        } catch (error) {
          const errorMessage = client.getErrorMessage(error.message, lang);
          client.sendErrorNotification(interaction, `${errorMessage}`, { editReply: true });
        }
        break;
      case "remove":
        const position = options.getInteger("position");
        const item = library[position - 1];
        if (!item) return client.sendErrorNotification(interaction, `${lang.ERROR_ITEM_INVALID_POSITION}`);
        // Remove item from library
        library.splice(position - 1, 1);
        await interaction.deferReply({ ephemeral: true }).catch((error) => { });
        try {
          // Update user data in database
          await client.updateUserData(user, { library: library });
          // Send advanced notification
          client.sendAdvancedNotification(interaction, `${item.isPlaylist ? lang.MESSAGE_LIBRARY_PLAYLIST_REMOVED : lang.MESSAGE_LIBRARY_SONG_REMOVED} (#${position})`, `${item.name}`, item.thumbnail, { editReply: true });
        } catch (error) {
          const errorMessage = client.getErrorMessage(error.message, lang);
          client.sendErrorNotification(interaction, `${errorMessage}`, { editReply: true });
        }
        break;
    }
  },
  subrun: async (client, interaction, subinteraction) => {
    const { guild, channel, message, member } = subinteraction;
    const guildData = await client.getGuildData(guild);
    const userData = await client.getUserData(member);
    const queue = client.distube.getQueue(guild);
    const lang = languages[guildData.language];
    const library = userData.library;
    const selectedItem = selections[message.id];

    switch (subinteraction.customId) {
      case "select":
        const value = Number(subinteraction.values[0]);
        // Update response
        await module.exports.updateResponse(interaction, lang, library, library[value]);
        selections[message.id] = library[value];
        subinteraction.deferUpdate().catch((error) => { });
        break;
      case "play":
        if (!member.voice.channel) return client.sendErrorNotification(subinteraction, `${lang.ERROR_MEMBER_MUST_JOIN_VOICE_CHANNEL}`);
        if (!client.checkMemberIsInMyVoiceChannel(guild, member) && queue) return client.sendErrorNotification(subinteraction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
        if (!client.handleCooldown("playQuery", member.id, 2000)) return client.sendErrorNotification(subinteraction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
        await subinteraction.deferReply().catch((error) => { });
        try {
          // Play or add item to the queue using selected item url
          await client.distube.play(member.voice.channel, selectedItem.url, { textChannel: channel, member: member, metadata: subinteraction });
        } catch (error) {
          const errorMessage = client.getErrorMessage(error.message, lang);
          client.sendErrorNotification(subinteraction, `${errorMessage}`, { editReply: true });
        }
        break;
      case "remove":
        const position = library.findIndex((item) => item.url === selectedItem.url);
        if (position === -1) return client.sendErrorNotification(subinteraction, `${selectedItem.isPlaylist ? lang.ERROR_LIBRARY_PLAYLIST_NOT_FOUND : lang.ERROR_LIBRARY_SONG_NOT_FOUND}`);
        // Remove item from library
        library.splice(position, 1);
        try {
          // Update user data in database
          await client.updateUserData(member, { library: library });
          if (library.length === 0) return interaction.deleteReply().catch((error) => { });
          // Update response
          await module.exports.updateResponse(interaction, lang, library, library[0]);
          selections[message.id] = library[0];
          subinteraction.deferUpdate().catch((error) => { });
        } catch (error) {
          const errorMessage = client.getErrorMessage(error.message, lang);
          client.sendErrorNotification(subinteraction, `${errorMessage}`);
        }
        break;
    }
  },
  updateResponse: async (interaction, lang, items, selectedItem) => {
    const options = items.map((item, i) => { return { label: `${i + 1}. ${item.name.length > config.SONG_NAME_MAX_LENGTH_DISPLAY ? item.name.substr(0, config.SONG_NAME_MAX_LENGTH_DISPLAY).concat("...") : item.name}`, description: `${item.author || "-"}`, emoji: item.isPlaylist ? elements.EMOJI_PLAYLIST : elements.EMOJI_SONG, value: `${i}`, default: item === selectedItem } });
    const libraryEmbed = new EmbedBuilder().setAuthor({ name: `${lang.MESSAGE_LIBRARY_TITLE}`, iconURL: interaction.user.displayAvatarURL({ forceStatic: true }) }).addFields({ name: `**${lang.MESSAGE_SONG_TITLE}**`, value: `[${selectedItem.name}](${selectedItem.url})`, inline: true }, { name: `**${lang.MESSAGE_SONG_AUTHOR}**`, value: `${selectedItem.author || "-"}`, inline: true }).setThumbnail(selectedItem.thumbnail).setColor(elements.COLOR_FLOPY);
    const libraryMenu = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("select").setOptions(options));
    const libraryButtons = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("play").setStyle(ButtonStyle.Primary).setLabel(`${lang.BUTTON_PLAY}`), new ButtonBuilder().setCustomId("remove").setStyle(ButtonStyle.Danger).setLabel(`${lang.BUTTON_LIBRARY_REMOVE_ITEM}`));
    const response = interaction.editReply({ embeds: [libraryEmbed], components: [libraryMenu, libraryButtons] });
    return response;
  }
}