module.exports.run = async (client, message, args, settings, queue, lang) => {
    const { guild, channel, member } = message
    const position = Number(args[0])

    if(!queue?.songs[1]) return client.sendError(channel, `${lang.ERROR_QUEUE_NO_SONG}`)
    if(!client.checkVoice(guild, member)) return client.sendError(channel, `${lang.ERROR_USER_NO_VOICE_2}`)
    if(isNaN(position)) return client.sendError(channel, `${lang.ERROR_COMMAND_ARGUMENT_INVALID}`)
    if(position < 1 || position > queue.songs.length - 1) return client.sendError(channel, `${lang.ERROR_SONG_NO_CORRECT_POSITION}`)
    if(client.cooldown("remove" + guild.id, 2000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
    queue.songs.splice(position, 1)
    client.updateDashboard(guild, queue, lang)
    client.sendMessage(channel, `${lang.MESSAGE_QUEUE_SONG_REMOVED} (#${position})`)
}
module.exports.data = {
    name: "remove",
    description: "HELP_COMMAND_REMOVE",
    usage: " [position]",
}