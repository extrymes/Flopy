module.exports.run = async (client, message, args, queue, settings, lang) => {
    if(queue?.songs[0]) {
        const song = queue?.songs[0]
        client.songFavavorites(message.author, lang, message.channel, song?.url)
    } else {
        const memberChannel = message.member.voice.channel
        if(memberChannel) {
            const userData = await client.getUser(message.author)
            if(userData) client.songPlayFavorites(message, userData.favorites)
            else client.sendError(message.channel, `${lang.ERROR_SONG_NO_FAVORITES}`)
        } else client.sendError(message.channel, `${lang.ERROR_USER_NO_CHANNEL}`)
    }
}
module.exports.help = {
    name: "fav"
}