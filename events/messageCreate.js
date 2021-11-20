module.exports = async(client, message) => {
    if(message.author.bot) return
    const guild = message.guild
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.language}`)

    if(message.channel.id === settings.dashboardChannel1) {
        if(!client.cooldown(message.author.id, 3000)) {
            if(message.content.startsWith(client.config.PREFIX)) {
                const args = message.content.slice(client.config.PREFIX.length).trim().split(/ +/g)
                const commande = args.shift()
                const cmd = client.commands.get(commande)
                if(cmd) cmd.run(client, message, args, settings, lang)
                else client.sendError(message.channel, `${lang.COMMAND_NO_FOUND}`)
            } else {
                const memberChannel = message.member.voice.channel
                if(memberChannel) {
                    const queue = client.player.getQueue(guild.id)
                    const clientChannel = guild.members.cache.get(client.user.id).voice.channel
                    if(!queue?.nowPlaying || clientChannel?.id === memberChannel?.id) client.musicPlay(guild, lang, message.channel, memberChannel, message.content)
                    else client.sendError(message.channel, `${lang.USER_NO_CORRECT_VOICE_CHANNEL}`)
                } else client.sendError(message.channel, `${lang.USER_NO_VOICE_CHANNEL}`)
            }
        } else client.sendError(message.channel, `${lang.USER_COOLDOWN}`)
        setTimeout(() => { message?.delete().catch(error => {}) }, 100)
    } else if(message.mentions.users.first() === client.user) {
        if(message.member.permissions.has("MANAGE_GUILD")) {
            if(!client.cooldown(message.author.id, 5000)) client.setupDashboard(guild, settings, lang, message.channel)
            else client.sendError(message.channel, `${lang.USER_COOLDOWN}`)
        } else client.sendError(message.channel, `${lang.USER_PERMISSION_MANAGE_SERVER}`)
        setTimeout(() => { message?.delete().catch(error => {}) }, 100)
    }
}
