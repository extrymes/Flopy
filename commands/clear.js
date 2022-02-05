module.exports.run = async (client, message, args, queue, settings, lang) => {
    const guild = message.guild
    const channel = message.channel
    const member = message.member

    if(!queue?.songs[1]) return client.sendError(channel, `${lang.ERROR_QUEUE_NO_SONG}`)
    if(!client.checkChannel(guild, member)) return client.sendError(channel, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    queue.songs = [ queue.songs[0] ]
    client.updateDashboard(guild, queue, lang)
    client.sendCorrect(channel, `${lang.QUEUE_CLEARED}`)
}
module.exports.help = {
    name: "clear",
    type: "command",
    title: "lang.HELP_COMMAND",
    description: "lang.HELP_COMMAND_CLEAR",
    usage: "",
}