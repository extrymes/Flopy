module.exports.run = async (client, message, args, queue, settings, lang) => {
    const song = queue?.songs[0]
    if(song) client.favoriteSongs(message.author, lang, message.channel, song.url)
    else {
        const userData = await client.getUser(message.author)
        if(userData) {
            const guild = message.guild
            const clientChannel = guild.me.voice.channel
            const memberChannel = message.member.voice.channel
            if(!client.cooldown(message.author.id, 3000)) {
                if(clientChannel?.id !== memberChannel?.id) client.leaveChannel(guild)
                client.playFavoriteSongs(message, userData.favorites)
            } else client.sendError(message.channel, `${lang.ERROR_USER_COOLDOWN}`)
        } else client.sendError(message.channel, `${lang.ERROR_SONG_NO_FAVORITES}`)
    }
}
module.exports.help = {
    name: "fav"
}