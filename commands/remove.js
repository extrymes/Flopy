module.exports.run = async (client, message, args, queue, settings, lang) => {
    const guild = message.guild
    const channel = message.channel
    const queueCount = queue?.songs?.length - 1
    const position = args[0]

    if(!queueCount > 0) return client.sendError(channel, `${lang.ERROR_QUEUE_NO_SONG}`)
    if(!client.checkChannel(guild, message.member)) return client.sendError(channel, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    if(isNaN(position)) return client.help(lang, channel, "remove")
    if(position < 1 || position > queueCount) return client.sendError(channel, `${lang.ERROR_SONG_NO_CORRECT_POSITION}`)
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