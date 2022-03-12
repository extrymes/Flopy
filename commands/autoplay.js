module.exports.run = async (client, message, args, settings, queue, lang) => {
    const { guild, channel, member } = message

    if(!queue) return client.sendError(channel, `${lang.ERROR_SONG_NO_PLAYING}`)
    if(!client.checkVoice(guild, member)) return client.sendError(channel, `${lang.ERROR_USER_NO_VOICE_2}`)
    if(client.cooldown("autoplay" + guild.id, 2000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
    const autoplay = client.distube.toggleAutoplay(queue)
    client.sendMessage(channel, `${autoplay ? lang.MESSAGE_QUEUE_AUTOPLAY_ENABLED : lang.MESSAGE_QUEUE_AUTOPLAY_DISABLED}`)
}
module.exports.help = {
    name: "autoplay",
    description: "HELP_COMMAND_AUTOPLAY",
    usage: "",
}