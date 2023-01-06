const languages = require("../util/languages")

module.exports.run = async (client, interaction, settings, queue, lang) => {
    const { guild, member, options } = interaction
    const position = options.getInteger("position")

    if(!queue?.songs[1]) return client.sendErrorNotification(interaction, `${lang.ERROR_QUEUE_NO_SONG}`)
    if(!client.checkVoice(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`)
    if(position < 1 || position > queue.songs.length - 1) return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_INVALID_POSITION}`)
    if(!client.manageCooldown("remove", guild.id, 2000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`)
    queue.songs.splice(position, 1)
    client.editDashboard(guild, queue, lang)
    client.sendNotification(interaction, `${lang.MESSAGE_QUEUE_SONG_REMOVED} (#${position})`)
}
module.exports.data = {
    name: "remove",
    description: languages["en"].COMMAND_REMOVE_DESCRIPTION,
    description_localizations: { "fr": languages["fr"].COMMAND_REMOVE_DESCRIPTION },
    options: [
        {
            name: "position",
            description: languages["en"].COMMAND_REMOVE_OPTION,
            description_localizations: { "fr": languages["fr"].COMMAND_REMOVE_OPTION },
            type: 4,
            required: true,
        },
    ],
    dm_permission: false,
}