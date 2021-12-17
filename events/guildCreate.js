module.exports = async (client, guild) => {
    const settings = await client.getGuild(guild)

    if(!settings) {
        await client.createGuild(guild)
        client.firstMessage(guild)
    } else {
        const queue = client.distube.getQueue(guild)
        const lang = require(`../util/lang/${settings.dashboard1.language}`)
        await client.getDashboard(guild, settings)
        setTimeout(() => { client.updateDashboard(guild, queue, lang) }, 1000)
    }
}