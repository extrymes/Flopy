module.exports = async (client, message) => {
    const guild = message.guild
    const settings = await client.getGuild(guild)
    
    if(message.id === settings.flopy1.message) {
        await client.updateGuild(guild, { flopy1: client.config.GUILD_DEFAULTSETTINGS.flopy1 })
        if(!client.cooldown("leave" + guild.id, 0)) client.leaveVoice(guild)
    }
}