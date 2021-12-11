module.exports = async (client, queue, song) => {
    const guild = queue.textChannel.guild
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.language}`)
    const dashboardChannel = guild.channels.cache.find(ch => ch.id === settings.dashboard1.channel)
    
    if(queue.songs[0] === song) client.help(lang, dashboardChannel)
    else {
        client.updateDashboard(queue, settings, lang, dashboardChannel)
        client.sendCorrect(dashboardChannel, `${lang.SONG_ADDED_TO_QUEUE}`)
    }
}