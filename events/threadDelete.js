module.exports = async (client, thread) => {
    const guild = thread.guild
    
    if(thread === client.cache["dashboard" + guild.id]?.channel) {
        delete client.cache["dashboard" + guild.id]
        client.leaveVoice(guild)
    }
}