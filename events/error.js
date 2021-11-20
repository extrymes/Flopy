module.exports = async (client, error, queue) => {
    const guild = queue.guild
    const settings = await client.getGuild(guild)
    const dashboardChannel1 = guild.channels.cache.find(ch => ch.id === settings.dashboardChannel1)
    client.sendError(dashboardChannel1, `${error}`)
}