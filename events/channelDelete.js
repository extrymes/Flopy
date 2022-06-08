module.exports = async (client, channel) => {
    const guild = channel.guild
    const settings = await client.getGuild(guild)
    
    if(channel.id === settings.flopy1.channel) {
        delete client.cache["dashboard" + guild.id]
        client.leaveVoice(guild)
    }
}