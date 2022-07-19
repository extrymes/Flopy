module.exports.run = async (client, message, args, settings, queue, lang) => {
    const { guild, channel, member } = message
    const filter = "mcompand"

    if(!queue) return client.sendError(channel, `${lang.ERROR_SONG_NO_PLAYING}`)
    if(!client.checkVoice(guild, member)) return client.sendError(channel, `${lang.ERROR_USER_NO_VOICE_2}`)
    if(client.cooldown(filter + guild.id, 2000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
    if(queue.filters.has(filter)) queue.filters.remove(filter)
    else queue.filters.add(filter)
    if(queue.paused) client.distube.resume(queue)
    const filters = queue.filters.names.map((item, i) => { return `\`${item}\`` }).join(", ")
    client.updateDashboard(guild, queue, lang)
    client.sendMessage(channel, `${lang.MESSAGE_SONG_FILTERS} ${queue.filters.size > 0 ? filters : lang.MESSAGE_SONG_FILTERS_NONE}`)
}
module.exports.data = {
    name: "mcompand",
    description: "HELP_FILTER",
    usage: "",
}