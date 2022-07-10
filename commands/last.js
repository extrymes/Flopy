module.exports.run = async (client, message, args, settings, queue, lang) => {
    const { guild, channel, member } = message

    if(!member.voice.channel) return client.sendError(channel, `${lang.ERROR_USER_NO_VOICE}`)
    if(!client.checkVoice(guild, member) && guild.me.voice.channel) return client.sendError(channel, `${lang.ERROR_USER_NO_VOICE_2}`)
    if(client.cooldown("play" + member.id, 2000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
    channel.sendTyping().catch(error => {})
    try { client.distube.play(member.voice.channel, client.cache["query" + member.id], { textChannel: channel, member: member }) } catch(error) { client.distube.emit("error", channel, error) }
}
module.exports.data = {
    name: "last",
    description: "HELP_COMMAND_LAST",
    usage: "",
}