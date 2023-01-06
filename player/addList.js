const languages = require("../util/languages")

module.exports = async (client, queue, playlist) => {
    const guild = queue.textChannel.guild
    const destination = playlist.metadata || client.dashboards.get(guild.id)?.channel
    const settings = await client.getGuild(guild)
    const lang = languages[settings.flopy1.language]

    client.queries.set(playlist.member.id, playlist.url)
    if(queue.songs[0] !== playlist.songs[0]) {
        client.editDashboard(guild, queue, lang)
        client.sendNotification(destination, `${lang.MESSAGE_QUEUE_PLAYLIST_ADDED} (#${queue.songs.indexOf(playlist.songs[0])})`)
    } else setTimeout(() => client.sendNotification(destination, `${lang.MESSAGE_PLAYLIST_PLAYING}`), 500)
}