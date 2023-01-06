const languages = require("../util/languages")

module.exports.run = async (client, interaction, settings, queue, lang) => {
    const { guild, member } = interaction

    if(!queue?.songs[1]) return client.sendErrorNotification(interaction, `${lang.ERROR_QUEUE_NO_SONG}`)
    if(!client.checkVoice(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`)
    queue.songs = [ queue.songs[0] ]
    client.editDashboard(guild, queue, lang)
    client.sendNotification(interaction, `${lang.MESSAGE_QUEUE_CLEARED}`)
}
module.exports.data = {
    name: "clear",
    description: languages["en"].COMMAND_CLEAR_DESCRIPTION,
    description_localizations: { "fr": languages["fr"].COMMAND_CLEAR_DESCRIPTION },
    dm_permission: false,
}