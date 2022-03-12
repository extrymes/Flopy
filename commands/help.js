module.exports.run = async (client, message, args, settings, queue, lang) => {
    const { guild, channel } = message
    const command = client.commands.filter(item => item.help.name !== "help").get(args[0])

    if(command) client.help(channel, lang, command)
    else {
        if(client.cooldown("help" + guild.id, 10000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
        client.help(channel, lang)
    }
}
module.exports.help = {
    name: "help",
}