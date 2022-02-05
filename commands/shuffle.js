module.exports.run = async (client, message, args, queue, settings, lang) => {
    const guild = message.guild
    const channel = message.channel
    const member = message.member

    if(!queue?.songs[1]) return client.sendError(channel, `${lang.ERROR_QUEUE_NO_SONG}`)
    if(!client.checkChannel(guild, member)) return client.sendError(channel, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    if(client.cooldown(guild.id + "shuffle", 2000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
    await client.distube.shuffle(queue)
    client.updateDashboard(guild, queue, lang)
    client.sendCorrect(channel, `${lang.QUEUE_SHUFFLED}`)
}
module.exports.help = {
    name: "shuffle",
    type: "command",
    title: "lang.HELP_COMMAND",
    description: "lang.HELP_COMMAND_SHUFFLE",
    usage: "",
}