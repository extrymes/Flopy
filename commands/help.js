module.exports.run = async (client, message, args, settings, lang, queue) => {
    const guild = message.guild
    const channel = message.channel
    const command = client.commands.filter(item => item.help.name !== "help").get(args[0])

    if(command) client.help(lang, channel, command)
    else {
        if(client.cooldown(guild.id + "help", 10000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
        client.help(lang, channel)
    }
}
module.exports.help = {
    name: "help",
}