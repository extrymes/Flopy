module.exports = async (client, message, query) => {
    const guild = message.guild
    const channel = message.channel
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.flopy1.language}`)
    
    client.sendError(channel, `${lang.ERROR_SONG_NO_FOUND}`)
}