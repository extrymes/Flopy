module.exports.run = async (client, message, args, queue, settings, lang) => {
    if(queue) {
        if(!client.cooldown(message.author.id, 3000)) client.infoSong(queue, lang, message.channel)
        else client.sendError(message.channel, `${lang.ERROR_USER_COOLDOWN}`)
    } else client.sendError(message.channel, `${lang.ERROR_SONG_NO_PLAYING}`)
}
module.exports.help = {
    name: "info"
}