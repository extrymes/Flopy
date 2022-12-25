module.exports = async (client, thread) => {
    const guild = thread.guild
    
    if(thread === client.dashboards.get(guild.id)?.channel) {
        client.dashboards.delete(guild.id)
        client.leaveVoice(guild)
    }
}