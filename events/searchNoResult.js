module.exports = async (client, message, queue) => {
    const guild = message.guild
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.dashboard1.language}`)
    const dashboardChannel = guild.channels.cache.find(ch => ch.id === settings.dashboard1.channel)
    
    client.sendError(dashboardChannel, `${lang.ERROR_RESULT_NO_FOUND}`)
}