module.exports = async (client, queue, song) => {
    const guild = queue.textChannel.guild
    const channel = client.cache["dashboard" + guild.id]?.channel
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.flopy1.language}`)
    
    client.cache["query" + song.member.id] = song.url
    if(queue.songs[0] === song) setTimeout(() => client.sendMessage(channel, `${lang.MESSAGE_SONG_PLAYING}`), 1000)
    else {
        client.updateDashboard(guild, queue, lang)
        client.sendMessage(channel, `${lang.MESSAGE_QUEUE_SONG_ADDED} (#${queue.songs.indexOf(song)})`)
    }
}