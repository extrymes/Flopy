module.exports.run = async (client, message, args, queue, settings, lang) => {
    client.sendCommands(lang, message.channel)
}
module.exports.help = {
    name: "help"
}