const languages = require("../util/languages")

module.exports = async (client, message) => {
    const { guild, channel, member, author } = message
    const settings = await client.getGuild(guild)
    const queue = client.distube.getQueue(guild)
    const lang = languages[settings.flopy1.language]

    if(author.bot) return

    if(channel === client.cache["dashboard" + guild.id]?.channel) {
        if(member.voice.channel) {
            if(client.checkVoice(guild, member) || !queue) {
                if(!client.cooldown("play" + member.id, 2000)) {
                    channel.sendTyping().catch(error => {})
                    client.distube.play(member.voice.channel, message.content, { textChannel: channel, member: member, metadata: {} }).catch(error => client.distube.emit("error", channel, error))
                } else client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
            } else client.sendError(channel, `${lang.ERROR_USER_NO_VOICE_2}`)
        } else client.sendError(channel, `${lang.ERROR_USER_NO_VOICE}`)
        message.delete().catch(error => {})
    } else if(message.mentions.users.first() === client.user) {
        if(client.checkManager(member)) {
            if(!client.cooldown("setup" + guild.id, 4000)) client.setupDashboard(guild, channel, settings)
            else client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
        } else client.sendError(channel, `${lang.ERROR_USER_NO_MANAGER}`)
        message.delete().catch(error => {})
    }
}