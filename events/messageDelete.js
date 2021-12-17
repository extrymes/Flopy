module.exports = async(client, message) => {
    const guild = message.guild
    const settings = await client.getGuild(guild)
    
    if(message.id === settings.dashboard1.message) {
        await client.updateGuild(guild, { dashboard1: client.config.GUILD_DEFAULTSETTINGS.dashboard1 })
        client.leaveChannel(guild)
    }
}