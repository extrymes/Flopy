module.exports = async (client, queue) => {
    const guild = queue.textChannel.guild
    const channel = queue.textChannel
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.flopy1.language}`)
    
    client.sendError(channel, `${lang.ERROR_VOICE_DISCONNECTED}`)
}