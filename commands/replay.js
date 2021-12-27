module.exports.run = async (client, message, args, queue, settings, lang) => {
    const guild = message.guild
    const channel = message.channel
    const song = queue?.songs[0]

    if(!song) return client.sendError(channel, `${lang.ERROR_SONG_NO_PLAYING}`)
    if(!client.checkChannel(guild, message.member)) return client.sendError(channel, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    if(song.isLive) return client.sendError(channel, `${lang.ERROR_ACTION_IMPOSSIBLE_WITH_LIVE}`)
    if(queue.paused) {
        client.distube.resume(queue)
        client.updateDashboard(guild, queue, lang)
    }
    client.distube.seek(queue, 0)
    client.sendCorrect(channel, `${lang.SONG_REPLAYED}`)
}
module.exports.help = {
    name: "replay",
    type: "command",
    title: "lang.HELP_COMMAND_REPLAY",
    description: "lang.HELP_COMMAND_REPLAY_DESCRIPTION",
    usage: "",
}