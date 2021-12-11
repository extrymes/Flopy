module.exports = async(client, message) => {
    const guild = message.guild
    const settings = await client.getGuild(guild)
    
    if(message.id === settings.dashboard1.message) {
        await client.updateGuild(guild, { dashboard1: { channel: "", message: "" } })
        client.channelLeave(guild)
    }
}