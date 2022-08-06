module.exports.run = async (client, interaction, settings, queue, lang) => {
    const { guild, member } = interaction

    if(!queue?.songs[0] || queue.filters.size < 1) return client.replyError(interaction, false, `${lang.ERROR_FILTER_NO_ACTIVE}`)
    if(!client.checkVoice(guild, member)) return client.replyError(interaction, false, `${lang.ERROR_USER_NO_VOICE_2}`)
    queue.filters.clear()
    if(queue.paused) client.distube.resume(queue)
    client.updateDashboard(guild, queue, lang)
    client.replyMessage(interaction, false, `${lang.MESSAGE_FILTERS_ACTIVE} ${lang.MESSAGE_FILTERS_NONE}`)
}
module.exports.data = {
    name: "reset",
    description: languages["en"].COMMAND_RESET_DESCRIPTION,
    description_localizations: { "fr": languages["fr"].COMMAND_RESET_DESCRIPTION },
    dm_permission: false,
}