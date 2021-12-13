const colors = require("colors")

module.exports = client => {
    console.log(`[-] ${client.user.username} is online`.green)
    client.user.setPresence({ activities: [{ name: `@${client.user.username}`, type: 'LISTENING' }], status: 'online' })

    console.log(`[!] Checking servers ...`.yellow)
    client.guilds.cache.forEach(async (guild, id) => {
        const settings = await client.getGuild(guild)
        if(!settings) {
            await client.createGuild(guild)
            client.firstMessage(guild)
        } else {
            const lang = require(`../util/lang/${settings.dashboard1.language}`)
            const queue = client.distube.getQueue(guild)
            const dashboardChannel = guild.channels.cache.find(ch => ch.id === settings.dashboard1.channel)
            dashboardChannel?.messages?.fetch(settings.dashboard1.message).catch(error => {}).then(dashboard => {
                if(dashboard) client.updateDashboard(queue, settings, lang, dashboardChannel)
                else client.updateGuild(guild, { dashboard1: client.config.GUILD_DEFAULTSETTINGS.dashboard1 })
            })
        }
    })
}