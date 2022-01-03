module.exports = async(client, message) => {
    if(message.author.bot) return
    const guild = message.guild
    const channel = message.channel
    const queue = client.distube.getQueue(guild)
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.dashboard1.language}`)

    if(channel.id === settings.dashboard1.channel) {
        if(message.content.startsWith(client.config.PREFIX)) {
            const args = message.content.slice(client.config.PREFIX.length).trim().split(/ +/g)
            const commande = args.shift()
            const cmd = client.commands.get(commande)
            if(cmd) {
                if(!client.cooldown(message.author.id, 2000)) cmd.run(client, message, args, queue, settings, lang)
                else client.sendError(channel, `${lang.ERROR_ACTION_TOO_LONG}`)
            } else client.sendError(channel, `${lang.ERROR_COMMAND_NO_FOUND}`)
        } else {
            if(client.checkChannel(guild, message.member)) {
                if(!client.cooldown(message.author.id, 2000)) {
                    channel.sendTyping().catch(error => {})
                    try { client.distube.play(message, message.content) } catch(error) { client.distube.emit("error", channel, error) }
                } else client.sendError(channel, `${lang.ERROR_ACTION_TOO_LONG}`)
            } else if(!queue) {
                if(message.member.voice.channel) {
                    if(!client.cooldown(message.author.id, 2000)) {
                        client.distube.voices.leave(guild)
                        channel.sendTyping().catch(error => {})
                        try { client.distube.play(message, message.content) } catch(error) { client.distube.emit("error", channel, error) }
                    } else client.sendError(channel, `${lang.ERROR_ACTION_TOO_LONG}`)
                } else client.sendError(channel, `${lang.ERROR_USER_NO_CHANNEL}`)
            } else client.sendError(channel, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
        }
        setTimeout(() => message?.delete().catch(error => {}), 100)
    } else if(message.mentions.users.first() === client.user) {
        if(message.member.permissions.has("MANAGE_GUILD")) {
            if(!client.cooldown(message.author.id, 3000)) client.setupDashboard(guild, settings, channel)
            else client.sendError(channel, `${lang.ERROR_ACTION_TOO_LONG}`)
        } else client.sendError(channel, `${lang.ERROR_USER_NO_PERMISSION}`)
        setTimeout(() => message?.delete().catch(error => {}), 100)
    }
}