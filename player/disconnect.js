module.exports = async (client, queue) => {
    const guild = queue.textChannel.guild
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.flopy1.language}`)
    
    client.sendError(queue.textChannel, `${lang.ERROR_CHANNEL_DISCONNECTED}`)
}