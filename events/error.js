module.exports = async (client, channel, error) => {
    const guild = channel.guild
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.language}`)
    if(error.message.includes("You do not have permission to join this voice channel")) client.sendError(channel, `${lang.ERROR_JOIN_CHANNEL}`)
    else if(error.message.includes("Video unavailable") || error.message.includes("This video is unavailable")) client.sendError(channel, `${lang.ERROR_VIDEO_UNAVAILABLE}`)
    else if(error.message.includes("Unsupported URL")) client.sendError(channel, `${lang.ERROR_URL_UNSUPPORTED}`)
    else client.sendError(channel, `${lang.ERROR_OCCURED}`)
}