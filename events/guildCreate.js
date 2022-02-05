module.exports = async (client, guild) => {
    const settings = await client.getGuild(guild)

    if(!settings) {
        await client.createGuild(guild)
        client.sendFirstMessage(guild)
    } else {
        const queue = client.distube.getQueue(guild)
        const lang = require(`../util/lang/${settings.flopy1.language}`)
        const found = await client.getDashboard(guild, settings)
        if(found) {
            const voiceChannel = guild.channels.cache.get(settings.flopy1.voice)
            try { client.distube.voices.join(voiceChannel) } catch {}
            setTimeout(() => client.updateDashboard(guild, queue, lang), 1000)
        }
    }
}