module.exports = async (client, messages) => {
    const guild = messages.first().guild
    const settings = await client.getGuild(guild)
    
    if(messages.get(settings.flopy1.message)) {
        await client.updateGuild(guild, { flopy1: client.config.GUILD_DEFAULTSETTINGS.flopy1 })
        client.distube.voices.leave(guild)
    }
}