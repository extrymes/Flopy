module.exports.run = async (client, message, args, queue, settings, lang) => {
    client.help(lang, message.channel)
}
module.exports.help = {
    name: "help"
}