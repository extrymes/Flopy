module.exports.run = async (client, message, args, settings, lang, queue) => {
    const guild = message.guild
    const channel = message.channel
    const member = message.member

    if(!queue) return client.sendError(channel, `${lang.ERROR_SONG_NO_PLAYING}`)
    if(!client.checkVoice(guild, member)) return client.sendError(channel, `${lang.ERROR_USER_NO_CORRECT_VOICE}`)
    if(client.cooldown(guild.id + "autoplay", 2000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
    const autoplay = client.distube.toggleAutoplay(queue)
    client.sendMessage(channel, `${autoplay ? lang.MESSAGE_QUEUE_AUTOPLAY_ENABLED : lang.MESSAGE_QUEUE_AUTOPLAY_DISABLED}`)
}
module.exports.help = {
    name: "autoplay",
    description: "HELP_COMMAND_AUTOPLAY",
    usage: "",
}