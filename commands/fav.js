const Discord = require("discord.js")

module.exports.run = async (client, message, args, settings, lang) => {
	const guild = message.guild
    const queue = client.player.getQueue(guild.id)
    if(queue?.nowPlaying) client.musicFavorite(message.author, lang, message.channel, queue?.nowPlaying?.url)
    else {
        const memberChannel = message.member.voice.channel
        if(memberChannel) {
            const userData = await client.getUser(message.author)
            if(userData) client.musicPlay(guild, memberChannel, userData.favorite)
            else client.sendError(message.channel, `${lang.USER_MUSIC_FAVORITE_NO}`)
        } else client.sendError(message.channel, `${lang.USER_NO_VOICE_CHANNEL}`)
    }
}
module.exports.help = {
    name: "fav"
}