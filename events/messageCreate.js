module.exports = async(client, message) => {
    if(message.author.bot) return
    const guild = message.guild
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.language}`)
    const queue = client.distube.getQueue(guild)

    if(message.channel.id === settings.dashboardChannel1) {
        if(message.content.startsWith(client.config.PREFIX)) {
            const args = message.content.slice(client.config.PREFIX.length).trim().split(/ +/g)
            const commande = args.shift()
            const cmd = client.commands.get(commande)
            if(cmd) {
                if(!client.cooldown(message.author.id, 3000)) cmd.run(client, message, args, queue, settings, lang)
                else client.sendError(message.channel, `${lang.ERROR_USER_COOLDOWN}`)
            } else client.sendError(message.channel, `${lang.ERROR_COMMAND_NO_FOUND}`)
        } else {
            const clientChannel = guild.members.cache.get(client.user.id).voice.channel
            const memberChannel = message.member.voice.channel
            if(memberChannel) {
                if(!clientChannel?.id || clientChannel?.id === memberChannel?.id) {
                    if(!client.cooldown(message.author.id, 3000)) client.songPlay(lang, message)
                    else client.sendError(message.channel, `${lang.ERROR_USER_COOLDOWN}`)
                }
                else client.sendError(message.channel, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
            } else client.sendError(message.channel, `${lang.ERROR_USER_NO_CHANNEL}`)
        }
        setTimeout(() => { message?.delete().catch(error => {}) }, 100)
    } else if(message.mentions.users.first() === client.user) {
        if(message.member.permissions.has("MANAGE_GUILD")) {
            if(!client.cooldown(message.author.id, 5000)) client.setupDashboard(guild, settings, lang, message.channel)
            else client.sendError(message.channel, `${lang.ERROR_USER_COOLDOWN}`)
        } else client.sendError(message.channel, `${lang.ERROR_USER_NO_PERMISSION_MANAGE_SERVER}`)
        setTimeout(() => { message?.delete().catch(error => {}) }, 100)
    }
}
