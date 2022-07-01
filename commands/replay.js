module.exports.run = async (client, message, args, settings, queue, lang) => {
    const { guild, channel, member } = message
    const song = queue?.songs[0]

    if(!queue) return client.sendError(channel, `${lang.ERROR_SONG_NO_PLAYING}`)
    if(!client.checkVoice(guild, member)) return client.sendError(channel, `${lang.ERROR_USER_NO_VOICE_2}`)
    if(song.isLive) return client.sendError(channel, `${lang.ERROR_ACTION_NOT_POSSIBLE}`)
    if(client.cooldown("replay" + guild.id, 4000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
    client.distube.seek(queue, 0)
    if(queue.paused) {
        client.distube.resume(queue)
        client.updateDashboard(guild, queue, lang)
    }
    client.sendMessage(channel, `${lang.MESSAGE_SONG_REPLAYED}`)
}
module.exports.data = {
    name: "replay",
    description: "HELP_COMMAND_REPLAY",
    usage: "",
}