module.exports.run = async (client, message, args, queue, settings, lang) => {
    const guild = message.guild
    const channel = message.channel
    const queueCount = queue?.songs?.length - 1
    const position = args[0]

    if(!queueCount > 0) return client.sendError(channel, `${lang.ERROR_QUEUE_NO_SONG}`)
    if(!client.checkChannel(guild, message.member)) return client.sendError(channel, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    if(isNaN(position)) return client.help(lang, channel, `remove`)
    if(position < 1 || position > queueCount) return client.sendError(channel, `${lang.ERROR_NO_CORRECT_SONG_POSITION}`)
    queue.songs.splice(position, 1)
    client.updateDashboard(guild, queue, lang)
    client.sendCorrect(channel, `${lang.SONG_REMOVED_FROM_QUEUE}`)
}
module.exports.help = {
    name: "remove",
    type: "command",
    title: "lang.HELP_COMMAND_REMOVE",
    description: "lang.HELP_COMMAND_REMOVE_DESCRIPTION",
    usage: " [position]",
}