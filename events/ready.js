const colors = require("colors")

module.exports = client => {
    console.log(`[-] ${client.user.username} is online`.green)
    client.user.setPresence({ status: 'online' })

    console.log(`[!] Checking new servers ...`.yellow)
    client.guilds.cache.forEach(async (guild, id) => {
        const settings = await client.getGuild(guild)
        if(!settings) {
            await client.createGuild(guild)
        } else {
            const dashboardChannel = guild.channels.cache.find(ch => ch.id === settings.dashboardChannel)
            dashboardChannel?.messages.fetch(settings.dashboardMessage).catch(error => {}).then(dashboard => {
                if(dashboard) client.updateDashboard(guild)
                else client.updateGuild(guild, { dashboardMessage: "", dashboardChannel: "" })
            })
        }
    })

}