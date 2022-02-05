module.exports.run = async (client, message, args, queue, settings, lang) => {
    const guild = message.guild
    const channel = message.channel
    const member = message.member
    const position = args[0]

    if(!queue?.songs[1]) return client.sendError(channel, `${lang.ERROR_QUEUE_NO_SONG}`)
    if(!client.checkChannel(guild, member)) return client.sendError(channel, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    if(isNaN(position)) return client.help(lang, channel, client.commands.get("remove"))
    if(position < 1 || position > queue.songs.length - 1) return client.sendError(channel, `${lang.ERROR_SONG_NO_CORRECT_POSITION}`)
    if(client.cooldown(guild.id + "remove", 2000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
    queue.songs.splice(position, 1)
    client.updateDashboard(guild, queue, lang)
    client.sendCorrect(channel, `${lang.QUEUE_SONG_REMOVED}`)
}
module.exports.help = {
    name: "remove",
    type: "command",
    title: "lang.HELP_COMMAND",
    description: "lang.HELP_COMMAND_REMOVE",
    usage: " [position]",
}