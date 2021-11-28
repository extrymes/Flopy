module.exports = async (client, message, queue) => {
    const guild = message.guild
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.language}`)
    const dashboardChannel1 = guild.channels.cache.find(ch => ch.id === settings.dashboardChannel1)
    client.sendError(dashboardChannel1, `${lang.ERROR_RESULT_NO_FOUND}`)
}