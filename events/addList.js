module.exports = async (client, queue, playlist) => {
    const guild = queue.textChannel.guild
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.dashboard1.language}`)
    const dashboardChannel = guild.channels.cache.find(ch => ch.id === settings.dashboard1.channel)

    if(queue.songs.length === playlist.songs.length) client.sendCommands(lang, dashboardChannel)
    else {
        client.updateDashboard(guild, queue, lang)
        client.sendCorrect(dashboardChannel, `${lang.SONG_ADDED_TO_QUEUE_2}`)
    }
}