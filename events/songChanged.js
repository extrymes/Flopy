module.exports = async (client, queue, newSong, oldSong) => {
    const guild = queue.guild
    const settings = await client.getGuild(guild)
    const dashboardChannel = guild.channels.cache.find(ch => ch.id === settings.dashboardChannel)
    dashboardChannel?.messages.fetch(settings.dashboardMessage).catch(error => {}).then(dashboard => {
        client.updateDashboard(guild, dashboard)
    })
}