module.exports = async (client, queue, song) => {
    const guild = queue.textChannel.guild
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.dashboard1.language}`)
    const dashboardChannel = guild.channels.cache.find(ch => ch.id === settings.dashboard1.channel)
    
    client.updateDashboard(queue, settings, lang, dashboardChannel)
}