module.exports.run = async (client, message, args, queue, settings, lang) => {
    const guild = message.guild
    if(queue?.songs[0]) {
        const clientChannel = guild.me.voice.channel
        const memberChannel = message.member.voice.channel
        if(clientChannel?.id === memberChannel?.id) client.songAutoplay(queue, lang, message.channel)
        else client.sendError(message.channel, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    } else client.sendError(message.channel, `${lang.ERROR_SONG_NO_PLAYING}`)
}
module.exports.help = {
    name: "auto"
}