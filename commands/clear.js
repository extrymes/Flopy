module.exports.run = async (client, message, args, settings, lang) => {
	const guild = message.guild
    const queue = client.player.getQueue(guild.id)
    if(queue?.songs?.length - 1 > 0) {
        const clientChannel = guild.members.cache.get(client.user.id).voice.channel
        const memberChannel = message.member.voice.channel
        if(clientChannel?.id === memberChannel?.id) client.musicClear(guild)
        else client.sendError(message.channel, `${lang.USER_NO_CORRECT_VOICE_CHANNEL}`)
    } else client.sendError(message.channel, `${lang.MUSIC_NO_QUEUE}`)
}
module.exports.help = {
    name: "clear"
}