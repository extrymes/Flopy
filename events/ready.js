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
            const dashboardChannel1 = guild.channels.cache.find(ch => ch.id === settings.dashboardChannel1)
            dashboardChannel1?.messages.fetch(settings.dashboardMessage1).catch(error => {}).then(dashboard => {
                if(dashboard) client.updateDashboard(guild)
                else client.updateGuild(guild, { dashboardMessage1: "", dashboardChannel1: "" })
            })
        }
    })

}