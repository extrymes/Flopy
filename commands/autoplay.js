module.exports.run = async (client, message, args, queue, settings, lang) => {
    if(queue?.playing) client.songAutoplay(queue, lang, message.channel)
    else client.sendError(message.channel, `${lang.SONG_NO_CURRENT_PLAYING}`)
}
module.exports.help = {
    name: "autoplay"
}