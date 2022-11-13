const languages = require("../util/languages")

module.exports = async (client, guild) => {
    const settings = await client.getGuild(guild)

    if(settings.null) {
        await client.createGuild(guild)
        client.sendFirstMessage(guild)
    } else {
        await client.getDashboard(guild, settings)
        if(client.cache["dashboard" + guild.id]) {
            const voice = guild.channels.cache.get(settings.flopy1.voice)
            const queue = client.distube.getQueue(guild)
            const lang = languages[settings.flopy1.language]
            client.editDashboard(guild, queue, lang)
            try { client.distube.voices.join(voice).catch(error => {}) } catch {}
        }
    }
}