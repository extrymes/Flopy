module.exports.run = async (client, message, args, queue, settings, lang) => {
    if(queue?.playing) {
        const song = queue?.songs[0]
        client.songFavorites(message.author, lang, message.channel, song?.url)
    }
    else {
        const memberChannel = message.member.voice.channel
        if(memberChannel) {
            const userData = await client.getUser(message.author)
            if(userData) client.songPlayFavorites(lang, message, userData.favorites)
            else client.sendError(message.channel, `${lang.SONG_FAVORITES_NO_ADDED}`)
        } else client.sendError(message.channel, `${lang.USER_NO_VOICE_CHANNEL}`)
    }
}
module.exports.help = {
    name: "fav"
}