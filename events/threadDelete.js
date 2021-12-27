module.exports = async(client, thread) => {
    const guild = thread.guild
    const settings = await client.getGuild(guild)
    
    if(thread.id === settings.dashboard1.channel) {
        await client.updateGuild(guild, { dashboard1: client.config.GUILD_DEFAULTSETTINGS.dashboard1 })
        client.distube.voices.leave(guild)
    }
}