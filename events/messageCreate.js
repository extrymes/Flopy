const Discord = require('discord.js')

module.exports = async(client, message) => {
    if(message.author.bot) return
    if(message.channel.type === "dm") return

    const guild = message.guild
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.language}`)

    // COMMANDS
    if(message.content.startsWith(settings.prefix)) {
        if(message.member !== null) {
            const args = message.content.slice(settings.prefix.length).trim().split(/ +/g)
            const commande = args.shift()
            const cmd = client.commands.get(commande)

            if(cmd) return cmd.run(client, message, args, settings, lang)
        }
    }

    // DASHBOARD
    if(message.channel.id === settings.dashboardChannel) {
        message?.delete().catch(error => {})
        if(message.content !== "") {
            const memberChannel = message.member.voice.channel
            if(memberChannel) {
                const queue = client.player.getQueue(guild.id)
                const clientChannel = guild.members.cache.get(client.user.id).voice.channel
                if(!queue?.nowPlaying || clientChannel?.id === memberChannel?.id) {
                    client.musicPlay(guild, memberChannel, message.content)
                } else client.sendRed(message.channel, `${lang.USER_NO_CORRECT_VOICE_CHANNEL}`)
            } else client.sendRed(message.channel, `${lang.USER_NO_VOICE_CHANNEL}`)
        }
    }

    // SETUP
    if(message.mentions.users.first() == client.user) {
        message?.delete().catch(error => {})
        if(message.member.permissions.has("MANAGE_GUILD")) {
            if(!client.cooldown(message.author.id, 5000)) {
                client.setupDashboard(guild, message.channel)
            } else client.sendRed(message.channel, `${lang.USER_COOLDOWN}`)
        } else client.sendRed(message.channel, `${lang.USER_PERMISSION_MANAGE_SERVER}`)
    }

}
