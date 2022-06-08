module.exports = client => {
    // Status
    console.log(`[-] ${client.user.username} is online`.green)
    client.user.setPresence({ activities: [{ name: `@${client.user.username}`, type: "LISTENING" }], status: "online" })

    // Servers
    console.log("[!] Checking servers ...".yellow)
    client.guilds.cache.forEach(async (guild, id) => {
        const settings = await client.getGuild(guild)
        if(settings.null) {
            await client.createGuild(guild)
            client.sendFirstMessage(guild)
        } else {
            const found = await client.getDashboard(guild, settings)
            if(found) {
                const voice = guild.channels.cache.get(settings.flopy1.voice)
                const queue = client.distube.getQueue(guild)
                const lang = require(`../util/lang/${settings.flopy1.language}`)
                client.updateDashboard(guild, queue, lang)
                try { client.distube.voices.join(voice) } catch {}
                //setTimeout(() => client.sendUpdateMessage(guild, lang), 5000)
            }
        }
    })
}