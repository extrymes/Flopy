module.exports = async (client, message) => {
    const guild = message.guild
    const settings = await client.getGuild(guild)
    
    if(message.id === settings.flopy1.message) {
        delete client.cache["dashboard" + guild.id]
        if(!client.cooldown("leaveVoice" + guild.id, 0)) client.leaveVoice(guild)
    }
}