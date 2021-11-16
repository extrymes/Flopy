const Discord = require("discord.js")

module.exports.run = async (client, message, args, settings, lang) => {
	const guild = message.guild
    const queue = client.player.getQueue(guild.id)
    if(queue?.nowPlaying) client.musicInfo(guild, lang, message.channel) 
    else client.sendError(message.channel, `${lang.MUSIC_NO_CURRENT_PLAYING}`)
}
module.exports.help = {
    name: "info"
}