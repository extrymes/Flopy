module.exports.run = async (client, message, args, queue, settings, lang) => {
    const guild = message.guild
    const channel = message.channel
    const member = message.member
    const queueCount = queue?.songs?.length - 1
    const position = args[0]

    if(!queueCount > 0) return client.sendError(channel, `${lang.ERROR_QUEUE_NO_SONG}`)
    if(!client.checkChannel(guild, member)) return client.sendError(channel, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    if(isNaN(position)) return client.help(lang, channel, "jump")
    if(position < 1 || position > queueCount) return client.sendError(channel, `${lang.ERROR_SONG_NO_CORRECT_POSITION}`)
    client.distube.jump(queue, Number(position))
    client.sendCorrect(channel, `${position === 1 ? lang.SONG_JUMPED : lang.SONG_JUMPED_2}`)
}
module.exports.help = {
    name: "jump",
    type: "command",
    title: "lang.HELP_COMMAND",
    description: "lang.HELP_COMMAND_JUMP",
    usage: " [position]",
}