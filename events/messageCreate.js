const languages = require("../util/languages")

module.exports = async (client, message) => {
    const { guild, channel, member } = message
    const settings = await client.getGuild(guild)
    const queue = client.distube.getQueue(guild)
    const lang = languages[settings.flopy1.language]

    if(message.author.bot) return

    if(channel === client.cache["dashboard" + guild.id]?.channel) {
        if(member.voice.channel) {
            if(client.checkVoice(guild, member) || !queue) {
                if(!client.cooldown("play" + member.id, 2000)) {
                    channel.sendTyping().catch(error => {})
                    client.distube.play(member.voice.channel, message.content, { textChannel: channel, member: member, metadata: {} }).catch(error => {
                        const errorMessage = client.getErrorMessage(error.message, lang)
                        client.sendError(channel, `${errorMessage}`)
                    })
                } else client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
            } else client.sendError(channel, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`)
        } else client.sendError(channel, `${lang.ERROR_USER_MUST_JOIN_VOICE}`)
        message.delete().catch(error => {})
    } else if(message.mentions.users.first() === client.user && !client.cooldown("help" + member.id, 4000)) client.sendHelpMessage(guild, channel, lang)
}