module.exports = async (client, message) => {
    if(message.author.bot) return
    const guild = message.guild
    const channel = message.channel
    const member = message.member
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.flopy1.language}`)
    const queue = client.distube.getQueue(guild)

    if(channel.id === settings.flopy1.channel) {
        if(message.content.startsWith(client.config.PREFIX)) {
            const args = message.content.slice(client.config.PREFIX.length).trim().split(/ +/g)
            const cmd = args.shift()
            const command = client.commands.get(cmd)
            if(command) command.run(client, message, args, settings, lang, queue)
            else client.sendError(channel, `${lang.ERROR_COMMAND_NO_FOUND}`)
        } else {
            if(member.voice.channel) {
                if(client.checkVoice(guild, member) || !queue) {
                    if(message.content) {
                        if(!client.cooldown(message.author.id + "play", 2000)) {
                            channel.sendTyping().catch(error => {})
                            if(!client.checkVoice(guild, member)) client.distube.voices.leave(guild)
                            try { client.distube.play(member.voice.channel, message.content, { textChannel: channel, member: member }) } catch(error) { client.distube.emit("error", channel, error) }
                        } else client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
                    } else client.sendError(channel, `${lang.ERROR_SONG_NO_FOUND}`)
                } else client.sendError(channel, `${lang.ERROR_USER_NO_CORRECT_VOICE}`)
            } else client.sendError(channel, `${lang.ERROR_USER_NO_VOICE}`)
        }
        message.delete().catch(error => {})
    } else if(message.mentions.users.first() === client.user) {
        if(client.checkManager(member)) {
            if(!client.cooldown(guild.id + "setup", 4000)) client.setupDashboard(guild, settings, channel)
            else client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
        } else client.sendError(channel, `${lang.ERROR_USER_NO_PERMISSION}`)
        message.delete().catch(error => {})
    }
}