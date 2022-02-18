module.exports.run = async (client, message, args, settings, lang, queue) => {
    const guild = message.guild
    const channel = message.channel
    const member = message.member

    if(!queue?.songs[1]) return client.sendError(channel, `${lang.ERROR_QUEUE_NO_SONG}`)
    if(!client.checkVoice(guild, member)) return client.sendError(channel, `${lang.ERROR_USER_NO_CORRECT_VOICE}`)
    if(client.cooldown(guild.id + "shuffle", 2000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
    await client.distube.shuffle(queue)
    client.updateDashboard(guild, lang, queue)
    client.sendMessage(channel, `${lang.MESSAGE_QUEUE_SHUFFLED}`)
}
module.exports.help = {
    name: "shuffle",
    type: "command",
    description: "HELP_COMMAND_SHUFFLE",
    usage: "",
}