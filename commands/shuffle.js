module.exports.run = async (client, message, args, queue, settings, lang) => {
    const guild = message.guild
    const channel = message.channel
    const member = message.member
    const queueCount = queue?.songs?.length - 1

    if(!queueCount > 0) return client.sendError(channel, `${lang.ERROR_QUEUE_NO_SONG}`)
    if(!client.checkChannel(guild, member)) return client.sendError(channel, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
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