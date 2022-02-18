module.exports = async (client, guild) => {
    const settings = await client.getGuild(guild)

    if(!settings) {
        await client.createGuild(guild)
        client.sendFirstMessage(guild)
    } else {
        const found = await client.getDashboard(guild, settings)
        if(found) {
            const lang = require(`../util/lang/${settings.flopy1.language}`)
            const queue = client.distube.getQueue(guild)
            const voice = guild.channels.cache.get(settings.flopy1.voice)
            client.updateDashboard(guild, lang, queue)
            try { client.distube.voices.join(voice) } catch {}
        }
    }
}