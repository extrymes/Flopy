module.exports.run = async (client, message, args, queue, settings, lang) => {
    const guild = message.guild
    if(!queue?.songs[0]) {
        const clientChannel = guild.members.cache.get(client.user.id).voice.channel
        const memberChannel = message.member.voice.channel
        if(memberChannel) {
            if(clientChannel !== memberChannel) client.join(lang, message.channel, memberChannel)
            else client.sendError(message.channel, `${lang.ERROR_CHANNEL_ALREADY_JOINED}`)
        } else client.sendError(message.channel, `${lang.ERROR_USER_NO_CHANNEL}`)
    } else client.sendError(message.channel, `${lang.SONG_PLAYING}`)
}
module.exports.help = {
    name: "join"
}