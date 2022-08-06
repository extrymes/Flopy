module.exports.run = async (client, interaction, settings, queue, lang) => {
    const { guild, member } = interaction

    if(!queue?.songs[1]) return client.replyError(interaction, false, `${lang.ERROR_QUEUE_NO_SONG}`)
    if(!client.checkVoice(guild, member)) return client.replyError(interaction, false, `${lang.ERROR_USER_NO_VOICE_2}`)
    queue.songs = [ queue.songs[0] ]
    client.updateDashboard(guild, queue, lang)
    client.replyMessage(interaction, false, `${lang.MESSAGE_QUEUE_CLEARED}`)
}
module.exports.data = {
    name: "clear",
    description: languages["en"].COMMAND_CLEAR_DESCRIPTION,
    description_localizations: { "fr": languages["fr"].COMMAND_CLEAR_DESCRIPTION },
    dm_permission: false,
}