module.exports.run = async (client, message, args, settings, lang, queue) => {
    const guild = message.guild
    const channel = message.channel
    const member = message.member
    const song = queue?.songs[0]

    if(!queue) return client.sendError(channel, `${lang.ERROR_SONG_NO_PLAYING}`)
    if(!client.checkVoice(guild, member)) return client.sendError(channel, `${lang.ERROR_USER_NO_CORRECT_VOICE}`)
    if(song.isLive) return client.sendError(channel, `${lang.ERROR_ACTION_IMPOSSIBLE_WITH_LIVE}`)
    if(client.cooldown(guild.id + "replay", 4000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
    if(queue.paused) {
        client.distube.resume(queue)
        client.updateDashboard(guild, lang, queue)
    }
    client.distube.seek(queue, 0)
    client.sendMessage(channel, `${lang.MESSAGE_SONG_REPLAYED}`)
}
module.exports.help = {
    name: "replay",
    type: "command",
    description: "HELP_COMMAND_REPLAY",
    usage: "",
}