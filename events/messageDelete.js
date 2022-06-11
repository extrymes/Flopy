module.exports = async (client, message) => {
    const guild = message.guild
    const settings = await client.getGuild(guild)
    
    if(message === client.cache["dashboard" + guild.id]) {
        delete client.cache["dashboard" + guild.id]
        if(!client.cooldown("leaveVoice" + guild.id, 0)) client.leaveVoice(guild)
    }
}