module.exports = async (client, queue, playlist) => {
    const guild = queue.textChannel.guild
    const channel = queue.textChannel
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.flopy1.language}`)

    if(queue.songs[0] === playlist.songs[0]) client.sendMessage(channel, `${lang.MESSAGE_PLAYLIST_PLAYING}`)
    else {
        client.updateDashboard(guild, lang, queue)
        client.sendMessage(channel, `${lang.MESSAGE_QUEUE_PLAYLIST_ADDED}`)
    }
}