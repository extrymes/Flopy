const languages = require("../util/languages")

module.exports.run = async (client, interaction, settings, queue, lang) => {
    const { guild, member, options } = interaction
    const subcommand = options.getSubcommand()

    switch(subcommand) {
        case "song":
            const position = options.getInteger("position")
            const song = queue?.songs[position]
            if(!song) return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_INVALID_POSITION}`)
            if(!client.checkVoice(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`)
            if(!client.manageCooldown("remove", guild.id, 2000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`)
            queue.songs.splice(position, 1)
            client.editDashboard(guild, queue, lang)
            client.sendAdvancedNotification(interaction, `${lang.MESSAGE_QUEUE_SONG_REMOVED} (#${position})`, song.name, song.thumbnail)
            break
        default:
            client.sendErrorNotification(interaction, `${lang.ERROR_UNKNOWN}`)
    }
}
module.exports.data = {
    name: "remove",
    description: languages["en"].COMMAND_REMOVE_DESCRIPTION,
    description_localizations: { "fr": languages["fr"].COMMAND_REMOVE_DESCRIPTION },
    options: [
        {
            name: "song",
            description: languages["en"].COMMAND_REMOVE_SONG_DESCRIPTION,
            description_localizations: { "fr": languages["fr"].COMMAND_REMOVE_SONG_DESCRIPTION },
            type: 1,
            options: [
                {
                    name: "position",
                    description: languages["en"].COMMAND_REMOVE_SONG_OPTION,
                    description_localizations: { "fr": languages["fr"].COMMAND_REMOVE_SONG_OPTION },
                    type: 4,
                    required: true,
                },
            ],
        },
    ],
    dm_permission: false,
}