module.exports.run = async (client, message, args, settings, lang, queue) => {
    const guild = message.guild
    const channel = message.channel
    const member = message.member
    const position = args[0]

    if(!queue?.songs[1]) return client.sendError(channel, `${lang.ERROR_QUEUE_NO_SONG}`)
    if(!client.checkVoice(guild, member)) return client.sendError(channel, `${lang.ERROR_USER_NO_CORRECT_VOICE}`)
    if(isNaN(position)) return client.help(lang, channel, client.commands.get("remove"))
    if(position < 1 || position > queue.songs.length - 1) return client.sendError(channel, `${lang.ERROR_SONG_NO_CORRECT_POSITION}`)
    if(client.cooldown(guild.id + "remove", 2000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
    queue.songs.splice(position, 1)
    client.updateDashboard(guild, lang, queue)
    client.sendMessage(channel, `${lang.MESSAGE_QUEUE_SONG_REMOVED}`)
}
module.exports.help = {
    name: "remove",
    description: "HELP_COMMAND_REMOVE",
    usage: " [position]",
}