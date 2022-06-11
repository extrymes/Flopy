module.exports = async (client, messages) => {
    const guild = messages.first().guild
    const settings = await client.getGuild(guild)
    
    if(messages.get(client.cache["dashboard" + guild.id]?.id)) {
        delete client.cache["dashboard" + guild.id]
        client.leaveVoice(guild)
    }
}