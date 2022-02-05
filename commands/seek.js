module.exports.run = async (client, message, args, queue, settings, lang) => {
    const guild = message.guild
    const channel = message.channel
    const song = queue?.songs[0]
    const time = args[0]

    if(!song) return client.sendError(channel, `${lang.ERROR_SONG_NO_PLAYING}`)
    if(!client.checkChannel(guild, message.member)) return client.sendError(channel, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    if(song.isLive) return client.sendError(channel, `${lang.ERROR_ACTION_IMPOSSIBLE_WITH_LIVE}`)
    if(isNaN(time) || time < 0) return client.help(lang, channel, client.commands.get("seek"))

    let sec = 0
    sec = sec + Number(time[time.length - 1] || 0)
    sec = sec + Number(time[time.length - 2] || 0) * 10
    sec = sec + Number(time[time.length - 3] || 0) * 60
    sec = sec + Number(time[time.length - 4] || 0) * 60 * 10
    sec = sec + Number(time[time.length - 5] || 0) * 60 * 60
    sec = sec + Number(time[time.length - 6] || 0) * 60 * 60 * 10

    if(sec > song.duration) return client.sendError(channel, `${lang.ERROR_SONG_TIME_LONGER}`)
    if(client.cooldown(guild.id + "seek", 2000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
    if(queue.paused) {
        client.distube.resume(queue)
        client.updateDashboard(guild, queue, lang)
    }
    await client.distube.seek(queue, sec)
    const bar = await client.createBar(queue, song)
    client.sendCorrect(channel, `${bar}`)
}
module.exports.help = {
    name: "seek",
    type: "command",
    title: "lang.HELP_COMMAND",
    description: "lang.HELP_COMMAND_SEEK",
    usage: " [time: hhmmss]",
}