module.exports = async(client, message) => {
    if(message.author.bot) return
    const guild = message.guild
    const queue = client.distube.getQueue(guild)
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.dashboard1.language}`)

    if(message.channel.id === settings.dashboard1.channel) {
        if(message.content.startsWith(client.config.PREFIX)) {
            const args = message.content.slice(client.config.PREFIX.length).trim().split(/ +/g)
            const commande = args.shift()
            const cmd = client.commands.get(commande)
            if(cmd) cmd.run(client, message, args, queue, settings, lang)
            else client.sendError(message.channel, `${lang.ERROR_COMMAND_NO_FOUND}`)
        } else {
            const clientChannel = guild.me.voice.channel
            const memberChannel = message.member.voice.channel
            if(memberChannel) {
                if(clientChannel?.id === memberChannel.id) {
                    if(!client.cooldown(message.author.id, 3000)) client.playSong(message)
                    else client.sendError(message.channel, `${lang.ERROR_USER_COOLDOWN}`)
                } else if(!queue) {
                    if(!client.cooldown(message.author.id, 3000)) {
                        client.leaveChannel(guild)
                        client.playSong(message)
                    } else client.sendError(message.channel, `${lang.ERROR_USER_COOLDOWN}`)
                } else client.sendError(message.channel, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
            } else client.sendError(message.channel, `${lang.ERROR_USER_NO_CHANNEL}`)
        }
        setTimeout(() => { message?.delete().catch(error => {}) }, 100)
    } else if(message.mentions.users.first() === client.user) {
        if(message.member.permissions.has("MANAGE_GUILD")) {
            if(!client.cooldown(message.author.id, 4000)) client.setupDashboard(guild, settings, message.channel)
            else client.sendError(message.channel, `${lang.ERROR_USER_COOLDOWN}`)
        } else client.sendError(message.channel, `${lang.ERROR_USER_NO_PERMISSION_MANAGE_SERVER}`)
        setTimeout(() => { message?.delete().catch(error => {}) }, 100)
    }
}
