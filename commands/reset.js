module.exports.run = async (client, message, args, settings, queue, lang) => {
    const { guild, channel, member } = message

    if(!queue?.songs[0] || queue.filters.size < 1) return client.sendError(channel, `${lang.ERROR_FILTER_NO_ACTIVE}`)
    if(!client.checkVoice(guild, member)) return client.sendError(channel, `${lang.ERROR_USER_NO_VOICE_2}`)
    queue.filters.clear()
    if(queue.paused) client.distube.resume(queue)
    client.updateDashboard(guild, queue, lang)
    client.sendMessage(channel, `${lang.MESSAGE_FILTERS_ACTIVE} ${lang.MESSAGE_FILTERS_NONE}`)
}
module.exports.data = {
    name: "reset",
    description: "HELP_COMMAND_RESET",
    usage: "",
}