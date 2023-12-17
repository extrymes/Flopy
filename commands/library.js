const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const elements = require("../utils/elements");
const languages = require("../utils/languages");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("library")
    .setDescription(`${languages["en"].COMMAND_LIBRARY_DESCRIPTION}`)
    .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_LIBRARY_DESCRIPTION}` })
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("play")
        .setDescription(`${languages["en"].COMMAND_LIBRARY_PLAY_DESCRIPTION}`)
        .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_LIBRARY_PLAY_DESCRIPTION}` })
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
      case "play":
        if (library.length === 0) return client.sendErrorNotification(interaction, `${lang.ERROR_LIBRARY_NO_ITEM}`);
        if (!client.manageCooldown("libraryCommand", user.id, 4000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
        // Send library
        const items = library.map((item, i) => { return { label: `${i + 1}. ${item.name.length > client.config.SONG_NAME_MAX_LENGTH_DISPLAY ? item.name.substr(0, client.config.SONG_NAME_MAX_LENGTH_DISPLAY).concat("...") : item.name}`, value: item.url, emoji: item.isPlaylist ? elements.EMOJI_PLAYLIST : elements.EMOJI_SONG } });
        const playlistsCount = library.filter((item) => item.isPlaylist).length;
        const libraryEmbed = new EmbedBuilder().setAuthor({ name: `${lang.MESSAGE_LIBRARY_TITLE}`, iconURL: elements.ICON_FLOPY }).setThumbnail(user.displayAvatarURL().replace("gif", "png")).addFields({ name: `${lang.MESSAGE_LIBRARY_NAME}`, value: `${user.username}`, inline: true }, { name: `${lang.MESSAGE_LIBRARY_SONGS}`, value: `${library.length - playlistsCount}`, inline: true }, { name: `${lang.MESSAGE_LIBRARY_PLAYLISTS}`, value: `${playlistsCount}`, inline: true }).setColor(elements.COLOR_FLOPY);
        const libraryMenu = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("play").setOptions(items));
        interaction.reply({ embeds: [libraryEmbed], components: [libraryMenu], ephemeral: true }).catch((error) => { });
        setTimeout(() => interaction.deleteReply().catch((error) => { }), 60000);
        break;
      case "add":
        const playing = queue?.songs[0]?.playlist || queue?.songs[0];
        if (!playing) return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_NO_PLAYING}`);
        const isPlaylist = playing.url.includes("playlist");
        if (library.length >= client.config.LIBRARY_MAX_LENGTH) return client.sendErrorNotification(interaction, `${lang.ERROR_LIBRARY_LIMIT_REACHED}`);
        if (library.find((item) => item.url === playing.url)) return client.sendErrorNotification(interaction, `${isPlaylist ? lang.ERROR_LIBRARY_PLAYLIST_ALREADY_ADDED : lang.ERROR_LIBRARY_SONG_ALREADY_ADDED}`);
        // Add item to library and update user data in database
        library.push({ name: playing.name, url: playing.url, isPlaylist: isPlaylist });
        await client.updateUserData(user, { library: library });
        // Send notification
        client.sendNotification(interaction, `${isPlaylist ? lang.MESSAGE_LIBRARY_PLAYLIST_ADDED : lang.MESSAGE_LIBRARY_SONG_ADDED} (#${library.length})`, { ephemeral: true });
        break;
      case "remove":
        const position = options.getInteger("position");
        const item = library[position - 1];
        if (!item) return client.sendErrorNotification(interaction, `${lang.ERROR_ITEM_INVALID_POSITION}`);
        // Remove item from library and update user data in database
        library.splice(position - 1, 1);
        await client.updateUserData(user, { library: library });
        // Send notification
        client.sendNotification(interaction, `${item.isPlaylist ? lang.MESSAGE_LIBRARY_PLAYLIST_REMOVED : lang.MESSAGE_LIBRARY_SONG_REMOVED} (#${position})`, { ephemeral: true });
        break;
      default:
        client.sendErrorNotification(interaction, `${lang.ERROR_UNKNOWN}`);
    }
  }
}