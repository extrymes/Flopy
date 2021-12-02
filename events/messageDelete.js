module.exports = async(client, message) => {
    const guild = message.guild
    const settings = await client.getGuild(guild)
    
    if(message.id === settings.dashboardMessage1) {
        await client.updateGuild(guild, { dashboardMessage1: "", dashboardChannel1: "" })
        client.leave(guild)
    }
}