module.exports.run = async (client, message, args, settings, queue, lang) => {
    const guild = message.guild
    const channel = message.channel
    const member = message.member
    const filter = "subboost"

    if(!queue) return client.sendError(channel, `${lang.ERROR_SONG_NO_PLAYING}`)
    if(!client.checkVoice(guild, member)) return client.sendError(channel, `${lang.ERROR_USER_NO_VOICE_2}`)
    if(client.cooldown(filter + guild.id, 2000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
    if(queue.paused) {
        client.distube.resume(queue)
        client.updateDashboard(guild, queue, lang)
    }
    const filters = client.distube.setFilter(queue, filter).map((item, i) => { return `\`${item}\`` }).join(", ")
    client.sendMessage(channel, `${lang.MESSAGE_SONG_FILTERS} ${queue.filters.length > 0 ? filters : lang.MESSAGE_SONG_FILTERS_NONE}`)
}
module.exports.help = {
    name: "subboost",
    description: "HELP_FILTER",
    usage: "",
}