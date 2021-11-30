module.exports.run = async (client, message, args, queue, settings, lang) => {
    const guild = message.guild
    if(queue?.songs[0]) {
        const clientChannel = guild.members.cache.get(client.user.id).voice.channel
        const memberChannel = message.member.voice.channel
        if(clientChannel?.id === memberChannel?.id) client.songAutoplay(queue, lang, message.channel)
        else client.sendError(message.channel, `${lang.USER_NO_CORRECT_CHANNEL}`)
    } else client.sendError(message.channel, `${lang.SONG_NO_PLAYING}`)
}
module.exports.help = {
    name: "auto"
}