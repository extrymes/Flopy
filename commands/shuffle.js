module.exports.run = async (client, message, args, queue, settings, lang) => {
	const guild = message.guild
    if(queue?.songs?.length - 1 > 0) {
        const clientChannel = guild.members.cache.get(client.user.id).voice.channel
        const memberChannel = message.member.voice.channel
        if(clientChannel?.id === memberChannel?.id) client.songMix(guild, queue, settings, lang, message.channel)
        else client.sendError(message.channel, `${lang.USER_NO_CORRECT_VOICE_CHANNEL}`)
    } else client.sendError(message.channel, `${lang.SONG_NO_QUEUE}`)
}
module.exports.help = {
    name: "mix"
}