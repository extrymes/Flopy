module.exports.run = async (client, message, args, settings, queue, lang) => {
    const { guild, channel, member } = message
    const position = Number(args[0])

    if(!queue?.songs[1]) return client.sendError(channel, `${lang.ERROR_QUEUE_NO_SONG}`)
    if(!client.checkVoice(guild, member)) return client.sendError(channel, `${lang.ERROR_USER_NO_VOICE_2}`)
    if(isNaN(position)) return client.sendHelpMessage(channel, lang, client.commands.get("jump"))
    if(position < 1 || position > queue.songs.length - 1) return client.sendError(channel, `${lang.ERROR_SONG_NO_CORRECT_POSITION}`)
    if(client.cooldown("jump" + guild.id, 2000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
    client.distube.jump(queue, position)
    if(queue.paused) client.distube.resume(queue)
    client.sendMessage(channel, `${position === 1 ? lang.MESSAGE_SONG_SKIPPED : lang.MESSAGE_SONG_SKIPPED_2.replace("$position", `#${position}`)}`)
}
module.exports.data = {
    name: "jump",
    description: "HELP_COMMAND_JUMP",
    usage: " [position]",
}