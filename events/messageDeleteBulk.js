module.exports = async(client, messages) => {
    const guild = client.guilds.cache.get(messages.first().guildId)
    const settings = await client.getGuild(guild)
    
    if(messages.find(message => message.id === settings.dashboardMessage1)) {
        await client.updateGuild(guild, { dashboardMessage1: "", dashboardChannel1: "" })
        client.leave(guild)
    }
}