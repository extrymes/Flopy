module.exports.run = async (client, message, args, queue, settings, lang) => {
    if(!client.cooldown(message.author.id, 3000)) client.sendCommands(lang, message.channel)
    else client.sendError(message.channel, `${lang.ERROR_USER_COOLDOWN}`)
}
module.exports.help = {
    name: "help"
}