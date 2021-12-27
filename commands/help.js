module.exports.run = async (client, message, args, queue, settings, lang) => {
    const channel = message.channel
    const command = client.commands.filter(item => item.help.name !== "help").find(item => item.help.name === args[0])

    if(command) client.help(lang, channel, `${command.help.name}`)
    else client.help(lang, channel)
}
module.exports.help = {
    name: "help",
    type: "command",
}