module.exports = async (client, message, query) => {
    const guild = message.guild
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.dashboard1.language}`)
    
    client.sendError(message.channel, `${lang.ERROR_RESULT_NO_FOUND}`)
}