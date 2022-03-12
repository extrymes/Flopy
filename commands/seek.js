module.exports.run = async (client, message, args, settings, queue, lang) => {
    const { guild, channel } = message
    const song = queue?.songs[0]
    const time = args[0]

    if(!queue) return client.sendError(channel, `${lang.ERROR_SONG_NO_PLAYING}`)
    if(!client.checkVoice(guild, message.member)) return client.sendError(channel, `${lang.ERROR_USER_NO_VOICE_2}`)
    if(song.isLive) return client.sendError(channel, `${lang.ERROR_ACTION_NOT_POSSIBLE}`)
    if(isNaN(time) || time < 0) return client.help(channel, lang, client.commands.get("seek"))
    const sec = await client.convertTime(time)
    if(sec > song.duration) return client.sendError(channel, `${lang.ERROR_SONG_TIME_LONGER}`)
    if(client.cooldown("seek" + guild.id, 4000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
    if(queue.paused) {
        client.distube.resume(queue)
        client.updateDashboard(guild, queue, lang)
    }
    client.distube.seek(queue, sec)
    const bar = await client.createBar(queue)
    client.sendMessage(channel, `${bar}`)
}
module.exports.help = {
    name: "seek",
    description: "HELP_COMMAND_SEEK",
    usage: " [time: hhmmss]",
}