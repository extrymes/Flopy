module.exports = async (client, channel, error) => {
    const guild = channel.guild
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.language}`)
    const dashboardChannel1 = guild.channels.cache.find(ch => ch.id === settings.dashboardChannel1)
    if(error.message.includes("You do not have permission to join this voice channel")) client.sendError(dashboardChannel1, `${lang.ERROR_CONNECT_VOICE}`)
    else if(error.message.includes("Video unavailable")) client.sendError(dashboardChannel1, `${lang.ERROR_VIDEO_UNAVAILABLE}`)
    else if(error.message.includes("Unsupported URL")) client.sendError(dashboardChannel1, `${lang.ERROR_URL_UNSUPPORTED}`)
    else client.sendError(dashboardChannel1, `${lang.ERROR_OCCURED}`)
}