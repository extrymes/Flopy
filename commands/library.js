const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js")
const elements = require("../util/elements")
const languages = require("../util/languages")

module.exports.run = async (client, interaction, settings, queue, lang) => {
    const { member, options } = interaction
    const subcommand = options.getSubcommand()
    const data = await client.getUser(member)
    const library = data.library

    switch(subcommand) {
        case "play":
            if(data.null) return client.replyError(interaction, false, `${lang.ERROR_LIBRARY_NO_ITEM}`)
            if(client.cooldown("library" + member.id, 4000)) return client.replyError(interaction, false, `${lang.ERROR_ACTION_NOT_POSSIBLE}`)
            const items = library.map((item, i) => { return { label: `${i + 1}. ${item.name.length <= client.config.SONG_MAX_LENGTH ? item.name : item.name.substring(0, client.config.SONG_MAX_LENGTH) + "..."}`, value: item.url, emoji: item.isPlaylist ? elements.EMOJI_PLAYLIST : elements.EMOJI_SONG } })
            const playlistsCount = library.filter(item => item.isPlaylist).length
            const libraryEmbed = new EmbedBuilder().setAuthor({ name: `${lang.MESSAGE_LIBRARY_TITLE}`, iconURL: elements.ICON_FLOPY }).setThumbnail(member.user.displayAvatarURL().replace("gif", "png")).addFields({ name: `${lang.MESSAGE_LIBRARY_NAME}`, value: `${member.user.username}`, inline: true }, { name: `${lang.MESSAGE_LIBRARY_SONGS}`, value: `${library.length - playlistsCount}`, inline: true }, { name: `${lang.MESSAGE_LIBRARY_PLAYLISTS}`, value: `${playlistsCount}`, inline: true }).setColor(elements.COLOR_FLOPY)
            const libraryMenu = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("play").setOptions(items))
            interaction.reply({ embeds: [libraryEmbed], components: [libraryMenu], ephemeral: true }).catch(error => {})
            setTimeout(() => interaction.deleteReply().catch(error => {}), 60000)
            break
        case "add":
            const playing = queue?.songs[0]?.playlist || queue?.songs[0]
            if(!playing) return client.replyError(interaction, false, `${lang.ERROR_SONG_NO_PLAYING}`)
            const isPlaylist = playing.url.includes("playlist") ? true : false
            if(library.length >= client.config.LIBRARY_MAX_ITEMS) return client.replyError(interaction, false, `${lang.ERROR_LIBRARY_LIMIT_REACHED}`)
            if(library.find(item => item.url === playing.url)) return client.replyError(interaction, false, `${isPlaylist ? lang.ERROR_LIBRARY_PLAYLIST_ALREADY_ADDED : lang.ERROR_LIBRARY_SONG_ALREADY_ADDED}`)
            library.push({ name: playing.name, url: playing.url, isPlaylist: isPlaylist })
            if(data.null) {
                await client.createUser(member)
                Object.assign(client.config.USER_DEFAULT_SETTINGS, { library: [] })
            }
            setTimeout(() => client.updateUser(member, { library: library }), 1000)
            client.replyMessage(interaction, false, `${isPlaylist ? lang.MESSAGE_LIBRARY_PLAYLIST_ADDED : lang.MESSAGE_LIBRARY_SONG_ADDED}`)
            break
        case "remove":
            const position = options.getInteger("position") - 1
            const item = library[position]
            if(!item) return client.replyError(interaction, false, `${lang.ERROR_ITEM_INVALID_POSITION}`)
            library.splice(position, 1)
            if(library.length > 0) client.updateUser(member, { library: library })
            else client.deleteUser(member)
            client.replyMessage(interaction, false, `${item.isPlaylist ? lang.MESSAGE_LIBRARY_PLAYLIST_REMOVED : lang.MESSAGE_LIBRARY_SONG_REMOVED}`)
            break
        default:
            client.replyError(interaction, false, `${lang.ERROR_UNKNOWN}`)
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