module.exports.run = async (client, message, args, settings, queue, lang) => {
    const { guild, channel } = message
    const cmd = args[0]
    const command = client.commands.filter(item => item.data.name !== "help").get(cmd)

    if(command) {
        if(client.cooldown("help" + command.data.name + guild.id, 8000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
        client.sendHelpMessage(channel, lang, command)
    } else {
        if(client.cooldown("help" + guild.id, 10000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
        client.sendHelpMessage(channel, lang)
    }
}
module.exports.data = {
    name: "help",
}