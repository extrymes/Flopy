const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js")
const elements = require("../utils/elements")
const languages = require("../utils/languages")

module.exports.run = async (client, interaction, settings, queue, lang) => {
    const { user, options } = interaction
    const subcommand = options.getSubcommand()
    const data = await client.getUser(user)
    const library = data?.library || new Array()

    switch(subcommand) {
        case "play":
            if(!data) return client.sendErrorNotification(interaction, `${lang.ERROR_LIBRARY_NO_ITEM}`)
            if(!client.manageCooldown("library", user.id, 4000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`)
            const items = library.map((item, i) => { return { label: `${i + 1}. ${item.name.length > client.config.SONG_MAX_DISPLAY ? item.name.substr(0, client.config.SONG_MAX_DISPLAY).concat("...") : item.name}`, value: item.url, emoji: item.isPlaylist ? elements.EMOJI_PLAYLIST : elements.EMOJI_SONG } })
            const playlistsCount = library.filter(item => item.isPlaylist).length
            const libraryEmbed = new EmbedBuilder().setAuthor({ name: `${lang.MESSAGE_LIBRARY_TITLE}`, iconURL: elements.ICON_FLOPY }).setThumbnail(user.displayAvatarURL().replace("gif", "png")).addFields({ name: `${lang.MESSAGE_LIBRARY_NAME}`, value: `${user.username}`, inline: true }, { name: `${lang.MESSAGE_LIBRARY_SONGS}`, value: `${library.length - playlistsCount}`, inline: true }, { name: `${lang.MESSAGE_LIBRARY_PLAYLISTS}`, value: `${playlistsCount}`, inline: true }).setColor(elements.COLOR_FLOPY)
            const libraryMenu = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("play").setOptions(items))
            interaction.reply({ embeds: [libraryEmbed], components: [libraryMenu], ephemeral: true }).catch(error => {})
            setTimeout(() => interaction.deleteReply().catch(error => {}), 60000)
            break
        case "add":
            const playing = queue?.songs[0]?.playlist || queue?.songs[0]
            if(!playing) return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_NO_PLAYING}`)
            const isPlaylist = playing.url.includes("playlist")
            if(library.length >= client.config.LIBRARY_MAX_LENGTH) return client.sendErrorNotification(interaction, `${lang.ERROR_LIBRARY_LIMIT_REACHED}`)
            if(library.find(item => item.url === playing.url)) return client.sendErrorNotification(interaction, `${isPlaylist ? lang.ERROR_LIBRARY_PLAYLIST_ALREADY_ADDED : lang.ERROR_LIBRARY_SONG_ALREADY_ADDED}`)
            library.push({ name: playing.name, url: playing.url, isPlaylist: isPlaylist })
            if(!data) await client.createUser(user)
            setTimeout(() => client.updateUser(user, { library: library }), 1000)
            client.sendNotification(interaction, `${isPlaylist ? lang.MESSAGE_LIBRARY_PLAYLIST_ADDED : lang.MESSAGE_LIBRARY_SONG_ADDED} (#${library.length})`, true)
            break
        case "remove":
            const position = options.getInteger("position")
            const item = library[position - 1]
            if(!item) return client.sendErrorNotification(interaction, `${lang.ERROR_ITEM_INVALID_POSITION}`)
            library.splice(position - 1, 1)
            if(library.length > 0) client.updateUser(user, { library: library })
            else client.deleteUser(user)
            client.sendNotification(interaction, `${item.isPlaylist ? lang.MESSAGE_LIBRARY_PLAYLIST_REMOVED : lang.MESSAGE_LIBRARY_SONG_REMOVED} (#${position})`, true)
            break
        default:
            client.sendErrorNotification(interaction, `${lang.ERROR_UNKNOWN}`)
    }
}
module.exports.data = {
    name: "library",
    description: languages["en"].COMMAND_LIBRARY_DESCRIPTION,
    description_localizations: { "fr": languages["fr"].COMMAND_LIBRARY_DESCRIPTION },
    options: [
        {
            name: "play",
            description: languages["en"].COMMAND_LIBRARY_PLAY_DESCRIPTION,
            description_localizations: { "fr": languages["fr"].COMMAND_LIBRARY_PLAY_DESCRIPTION },
            type: 1,
        },
        {
            name: "add",
            description: languages["en"].COMMAND_LIBRARY_ADD_DESCRIPTION,
            description_localizations: { "fr": languages["fr"].COMMAND_LIBRARY_ADD_DESCRIPTION },
            type: 1,
        },
        {
            name: "remove",
            description: languages["en"].COMMAND_LIBRARY_REMOVE_DESCRIPTION,
            description_localizations: { "fr": languages["fr"].COMMAND_LIBRARY_REMOVE_DESCRIPTION },
            type: 1,
            options: [
                {
                    name: "position",
                    description: languages["en"].COMMAND_LIBRARY_REMOVE_OPTION,
                    description_localizations: { "fr": languages["fr"].COMMAND_LIBRARY_REMOVE_OPTION },
                    type: 4,
                    required: true,
                },
            ],
        },
    ],
    dm_permission: false,
}