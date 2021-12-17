module.exports.run = async (client, message, args, queue, settings, lang) => {
    const song = queue?.songs[0]
    if(song) {
        client.favoriteSongs(message.author, lang, message.channel, song.url)
    } else {
        const memberChannel = message.member.voice.channel
        if(memberChannel) {
            const userData = await client.getUser(message.author)
            if(userData) client.playFavoriteSongs(message, userData.favorites)
            else client.sendError(message.channel, `${lang.ERROR_SONG_NO_FAVORITES}`)
        } else client.sendError(message.channel, `${lang.ERROR_USER_NO_CHANNEL}`)
    }
}
module.exports.help = {
    name: "fav"
}