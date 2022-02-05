module.exports = async (client, channel, error) => {
    const guild = channel.guild
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.flopy1.language}`)
 
    if(error.message.includes("You do not have permission to join this voice channel") || error.message.includes("Cannot connect to the voice channel") || error.message.includes("The voice channel is full")) client.sendError(channel, `${lang.ERROR_UNABLE_TO_JOIN_CHANNEL}`)
    else if(error.message.includes("No result found")) client.sendError(channel, `${lang.ERROR_SONG_NO_FOUND}`)
    else if(error.message.includes("Video unavailable") || error.message.includes("This video is unavailable")) client.sendError(channel, `${lang.ERROR_VIDEO_UNAVAILABLE}`)
    else if(error.message.includes("Unsupported URL") || error.message.includes("This url is not supported")) client.sendError(channel, `${lang.ERROR_URL_UNSUPPORTED}`)
    else if(error.message.includes("Unknown Playlist")) client.sendError(channel, `${lang.ERROR_UNKNOWN_PLAYLIST}`)
    else if(error.message.includes("Sign in to confirm your age")) client.sendError(channel, `${lang.ERROR_AGE_RESTRICTED}`)
    else {
        client.sendError(channel, `${lang.ERROR_OCCURED}`)
        console.log(error.message)
    }
}