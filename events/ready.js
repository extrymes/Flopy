const colors = require("colors")

module.exports = client => {
    console.log(`[-] ${client.user.username} is online`.green)
    client.user.setPresence({ activities: [{ name: `@${client.user.username}`, type: "LISTENING" }], status: "online" })

    console.log("[!] Checking servers ...".yellow)
    client.guilds.cache.forEach(async (guild, id) => {
        const settings = await client.getGuild(guild)
        if(settings.null) {
            await client.createGuild(guild)
            client.sendFirstMessage(guild)
        } else {
            const found = await client.getDashboard(guild, undefined, settings)
            if(found) {
                const voice = guild.channels.cache.get(settings.flopy1.voice)
                const queue = client.distube.getQueue(guild)
                const lang = require(`../util/lang/${settings.flopy1.language}`)
                client.updateDashboard(guild, queue, lang)
                try { client.distube.voices.join(voice) } catch {}
                //setTimeout(() => client.sendUpdateMessage(guild, lang), 5000)
            } else client.updateGuild(guild, { flopy1: client.config.GUILD_DEFAULTSETTINGS.flopy1 })
        }
    })
}