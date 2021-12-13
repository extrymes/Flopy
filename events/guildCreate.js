module.exports = async (client, guild) => {
    const settings = await client.getGuild(guild)

    if(!settings) {
        await client.createGuild(guild)
        client.firstMessage(guild)
    } else {
        const dashboardChannel = guild.channels.cache.find(ch => ch.id === settings.dashboard1.channel)
        dashboardChannel?.messages?.fetch(settings.dashboard1.message).catch(error => {}).then(dashboard => {
            if(!dashboard) client.updateGuild(guild, { dashboard1: client.config.GUILD_DEFAULTSETTINGS.dashboard1 })
        })
    }
}