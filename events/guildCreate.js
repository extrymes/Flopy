module.exports = async (client, guild) => {
    const settings = await client.getGuild(guild)

    if(!settings) {
        await client.createGuild(guild)
        client.sendFirstMessage(guild)
    } else {
        const found = await client.getDashboard(guild, undefined, settings)
        if(found) {
            const queue = client.distube.getQueue(guild)
            const voice = guild.channels.cache.get(settings.flopy1.voice)
            const lang = require(`../util/lang/${settings.flopy1.language}`)
            client.updateDashboard(guild, queue, lang)
            try { client.distube.voices.join(voice) } catch {}
        }
    }
}