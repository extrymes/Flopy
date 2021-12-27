const colors = require("colors")

module.exports = client => {
    console.log(`[-] ${client.user.username} is online`.green)
    client.user.setPresence({ activities: [{ name: `@${client.user.username}`, type: 'LISTENING' }], status: 'online' })

    console.log(`[!] Checking servers ...`.yellow)
    client.guilds.cache.forEach(async (guild, id) => {
        const settings = await client.getGuild(guild)
        if(!settings) {
            await client.createGuild(guild)
            client.sendFirstMessage(guild)
        } else {
            const queue = client.distube.getQueue(guild)
            const lang = require(`../util/lang/${settings.dashboard1.language}`)
            await client.getDashboard(guild, settings)
            setTimeout(() => client.updateDashboard(guild, queue, lang), 1000)
            setTimeout(() => client.sendUpdateMessage(guild, lang), 5000)
        }
    })
}