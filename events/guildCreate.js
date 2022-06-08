module.exports = async (client, guild) => {
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
        }
    }
}