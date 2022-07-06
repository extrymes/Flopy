module.exports = async (client, messages) => {
    const guild = messages.first().guild
    
    if(messages.get(client.cache["dashboard" + guild.id]?.id)) {
        delete client.cache["dashboard" + guild.id]
        client.leaveVoice(guild)
    }
}