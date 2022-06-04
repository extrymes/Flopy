module.exports.run = async (client, message, args, settings, queue, lang) => {
    const { guild, channel, member } = message

    if(!queue?.songs[1]) return client.sendError(channel, `${lang.ERROR_QUEUE_NO_SONG}`)
    if(!client.checkVoice(guild, member)) return client.sendError(channel, `${lang.ERROR_USER_NO_VOICE_2}`)
    if(client.cooldown("shuffle" + guild.id, 2000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
    await client.distube.shuffle(queue)
    client.updateDashboard(guild, queue, lang)
    client.sendMessage(channel, `${lang.MESSAGE_QUEUE_SHUFFLED}`)
}
module.exports.data = {
    name: "shuffle",
    description: "HELP_COMMAND_SHUFFLE",
    usage: "",
}