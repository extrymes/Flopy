module.exports.run = async (client, message, args, settings, queue, lang) => {
    const guild = message.guild
    const channel = message.channel
    const member = message.member

    if(!queue?.songs[1]) return client.sendError(channel, `${lang.ERROR_QUEUE_NO_SONG}`)
    if(!client.checkVoice(guild, member)) return client.sendError(channel, `${lang.ERROR_USER_NO_VOICE_2}`)
    queue.songs = [ queue.songs[0] ]
    client.updateDashboard(guild, queue, lang)
    client.sendMessage(channel, `${lang.MESSAGE_QUEUE_CLEARED}`)
}
module.exports.help = {
    name: "clear",
    description: "HELP_COMMAND_CLEAR",
    usage: "",
}