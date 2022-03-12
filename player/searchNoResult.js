module.exports = async (client, message, query) => {
    const { guild, channel } = message
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.flopy1.language}`)
    
    client.sendError(channel, `${lang.ERROR_SONG_NO_FOUND}`)
}