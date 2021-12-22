module.exports.run = async (client, message, args, queue, settings, lang) => {
    if(queue) {
        const guild = message.guild
        const clientChannel = guild.me.voice.channel
        const memberChannel = message.member.voice.channel
        if(clientChannel?.id === memberChannel?.id) {
            if(!client.cooldown(message.author.id, 3000)) client.autoPlaySong(queue, lang, message.channel)
            else client.sendError(message.channel, `${lang.ERROR_USER_COOLDOWN}`)
        } else client.sendError(message.channel, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    } else client.sendError(message.channel, `${lang.ERROR_SONG_NO_PLAYING}`)
}
module.exports.help = {
    name: "auto"
}