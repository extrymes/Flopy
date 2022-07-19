module.exports.run = async (client, message, args, settings, queue, lang) => {
    const { guild, channel, member } = message
    const query = args.slice(0).join(" ")

    if(!member.voice.channel) return client.sendError(channel, `${lang.ERROR_USER_NO_VOICE}`)
    if(!client.checkVoice(guild, member) && queue) return client.sendError(channel, `${lang.ERROR_USER_NO_VOICE_2}`)
    if(!query) return client.sendHelpMessage(channel, lang, client.commands.get("first"))
    if(client.cooldown("play" + member.id, 2000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
    channel.sendTyping().catch(error => {})
    client.distube.play(member.voice.channel, query, { textChannel: channel, member: member, position: 1 }).catch(error => client.distube.emit("error", channel, error))
}
module.exports.data = {
    name: "first",
    description: "HELP_COMMAND_FIRST",
    usage: " [query]",
}