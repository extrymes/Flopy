module.exports = async(client, channel) => {
    const guild = channel.guild
    const settings = await client.getGuild(guild)
    
    if(channel.id === settings.dashboard1.channel) {
        await client.updateGuild(guild, { dashboard1: { channel: "", message: "", language: settings.dashboard1.language } })
        client.channelLeave(guild)
    }
}
