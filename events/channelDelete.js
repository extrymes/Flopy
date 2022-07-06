module.exports = async (client, channel) => {
    const guild = channel.guild
    
    if(channel === client.cache["dashboard" + guild.id]?.channel) {
        delete client.cache["dashboard" + guild.id]
        client.leaveVoice(guild)
    }
}