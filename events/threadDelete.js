module.exports = async (client, thread) => {
    const guild = thread.guild
    const settings = await client.getGuild(guild)
    
    if(thread.id === settings.flopy1.channel) {
        await client.updateGuild(guild, { flopy1: client.config.GUILD_DEFAULTSETTINGS.flopy1 })
        delete client.cache["dashboard" + guild.id]
        client.leaveVoice(guild)
    }
}