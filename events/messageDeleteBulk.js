module.exports = async(client, messages) => {
    const guild = client.guilds.cache.get(messages.first().guildId)
    const settings = await client.getGuild(guild)
    
    if(messages.find(message => message.id === settings.dashboard1.message)) {
        await client.updateGuild(guild, { dashboard1: client.config.GUILD_DEFAULTSETTINGS.dashboard1 })
        client.distube.voices.leave(guild)
    }
}