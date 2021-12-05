module.exports = async(client, channel) => {
    const guild = channel.guild
    const settings = await client.getGuild(guild)
    
    if(channel.id === settings.dashboardChannel1) {
        await client.updateGuild(guild, { dashboardMessage1: "", dashboardChannel1: "" })
        client.channelLeave(guild)
    }
}
