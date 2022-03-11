module.exports = async (client, channel, error) => {
    const guild = channel.guild
    const message = error.message
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.flopy1.language}`)
 
    if(message.includes("You do not have permission to join this voice channel") || message.includes("Cannot connect to the voice channel") || message.includes("The voice channel is full")) client.sendError(channel, `${lang.ERROR_VOICE_UNABLE_JOIN}`)
    else if(message.includes("No result found")) client.sendError(channel, `${lang.ERROR_SONG_NO_FOUND}`)
    else if(message.includes("Video unavailable") || message.includes("This video is unavailable")) client.sendError(channel, `${lang.ERROR_VIDEO_UNAVAILABLE}`)
    else if(message.includes("Sign in to confirm your age") || message.includes("Sorry, this content is age-restricted") || message.includes("This video is only available to Music Premium members")) client.sendError(channel, `${lang.ERROR_VIDEO_RESTRICTED}`)
    else if(message.includes("Unsupported URL") || message.includes("This url is not supported")) client.sendError(channel, `${lang.ERROR_URL_UNSUPPORTED}`)
    else if(message.includes("Unknown Playlist")) client.sendError(channel, `${lang.ERROR_PLAYLIST_UNKNOWN}`)
    else {
        client.sendError(channel, `${lang.ERROR_OCCURED}`)
        console.log(message)
    }
}