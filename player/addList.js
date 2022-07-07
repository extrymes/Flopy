module.exports = async (client, queue, playlist) => {
    const guild = queue.textChannel.guild
    const channel = queue.textChannel
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.flopy1.language}`)

    client.cache["query" + playlist.member.id] = playlist.url
    if(queue.songs[0] === playlist.songs[0]) setTimeout(() => client.sendMessage(channel, `${lang.MESSAGE_PLAYLIST_PLAYING}`), 1000)
    else {
        client.updateDashboard(guild, queue, lang)
        client.sendMessage(channel, `${lang.MESSAGE_QUEUE_PLAYLIST_ADDED} (#${queue.songs.length - playlist.songs.length})`)
    }
}