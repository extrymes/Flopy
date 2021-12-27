module.exports.run = async (client, message, args, queue, settings, lang) => {
    const guild = message.guild
    const channel = message.channel
    const filter = "pulsator"

    if(!queue) return client.sendError(channel, `${lang.ERROR_SONG_NO_PLAYING}`)
    if(!client.checkChannel(guild, message.member)) return client.sendError(channel, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    if(queue.paused) {
        client.distube.resume(queue)
        client.updateDashboard(guild, queue, lang)
    }
    const filters = client.distube.setFilter(queue, filter).map((item, i) => { return `\`${item}\`` }).join(", ")
    const filtersCount = queue.filters.length
    client.sendCorrect(channel, `${filtersCount === 0 ? `${lang.SONG_FILTER_ACTIVE} ${lang.SONG_FILTER_ACTIVE_NONE}` : filtersCount === 1 ? `${lang.SONG_FILTER_ACTIVE} ${filters}` : `${lang.SONG_FILTER_ACTIVE_2} ${filters}`}`)
}
module.exports.help = {
    name: "pulsator",
    type: "filter",
    title: "lang.HELP_COMMAND_FILTER",
    description: "lang.HELP_COMMAND_FILTER_DESCRIPTION",
    usage: "",
}