module.exports = async (client, queue, playlist) => {
    const guild = queue.textChannel.guild
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.dashboard1.language}`)

    if(queue.songs[0] === playlist.songs[0]) client.sendCorrect(queue.textChannel, `${lang.PLAYLIST_PLAYING}`)
    else {
        client.updateDashboard(guild, queue, lang)
        client.sendCorrect(queue.textChannel, `${lang.QUEUE_PLAYLIST_ADDED}`)
    }
}