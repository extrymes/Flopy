module.exports = async (client, channel) => {
    const guild = channel.guild
    const settings = await client.getGuild(guild)
    
    if(channel === client.cache["dashboard" + guild.id]?.channel) {
        delete client.cache["dashboard" + guild.id]
        client.leaveVoice(guild)
    }
}