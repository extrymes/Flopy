module.exports.run = async (client, message, args, queue, settings, lang) => {
    const guild = message.guild
    const channel = message.channel

    if(!queue) return client.sendError(channel, `${lang.ERROR_SONG_NO_PLAYING}`)
    if(!client.checkChannel(guild, message.member)) return client.sendError(channel, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    const autoplay = client.distube.toggleAutoplay(queue)
    client.sendCorrect(channel, `${autoplay ? lang.QUEUE_AUTOPLAY_ENABLED : lang.QUEUE_AUTOPLAY_DISABLED}`)
}
module.exports.help = {
    name: "autoplay",
    type: "command",
    title: "lang.HELP_COMMAND",
    description: "lang.HELP_COMMAND_AUTOPLAY",
    usage: "",
}