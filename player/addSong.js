const languages = require("../util/languages")

module.exports = async (client, queue, song) => {
    const guild = queue.textChannel.guild
    const destination = song.metadata || client.dashboards.get(guild.id)?.channel
    const settings = await client.getGuild(guild)
    const lang = languages[settings.flopy1.language]
    
    client.queries.set(song.member.id, song.url)
    if(queue.songs[0] !== song) {
        client.editDashboard(guild, queue, lang)
        client.sendNotification(destination, `${lang.MESSAGE_QUEUE_SONG_ADDED} (#${queue.songs.indexOf(song)})`)
    } else setTimeout(() => client.sendNotification(destination, `${lang.MESSAGE_SONG_PLAYING}`), 500)
}