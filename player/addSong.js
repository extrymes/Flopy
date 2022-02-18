module.exports = async (client, queue, song) => {
    const guild = queue.textChannel.guild
    const channel = queue.textChannel
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.flopy1.language}`)
    
    if(queue.songs[0] === song) client.sendMessage(channel, `${lang.MESSAGE_SONG_PLAYING}`)
    else {
        client.updateDashboard(guild, lang, queue)
        client.sendMessage(channel, `${lang.MESSAGE_QUEUE_SONG_ADDED}`)
    }
}