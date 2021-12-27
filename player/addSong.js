module.exports = async (client, queue, song) => {
    const guild = queue.textChannel.guild
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.dashboard1.language}`)
    
    if(queue.songs[0] === song) client.sendCorrect(queue.textChannel, `${lang.SONG_PLAYING}`)
    else {
        client.updateDashboard(guild, queue, lang)
        client.sendCorrect(queue.textChannel, `${lang.SONG_ADDED_TO_QUEUE}`)
    }
}