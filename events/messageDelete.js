module.exports = async (client, message) => {
    const guild = message.guild
    
    if(message === client.dashboards.get(guild.id)) {
        client.dashboards.delete(guild.id)
        if(client.manageCooldown("leaveVoice", guild.id, 0)) client.leaveVoice(guild)
    }
}