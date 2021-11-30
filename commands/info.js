module.exports.run = async (client, message, args, queue, settings, lang) => {
    if(queue?.songs[0]) client.songInfo(queue, lang, message.channel)
    else client.sendError(message.channel, `${lang.SONG_NO_PLAYING}`)
}
module.exports.help = {
    name: "info"
}