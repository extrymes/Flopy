module.exports = async (client, queue, playlist) => {
    const guild = queue?.textChannel?.guild
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.language}`)
    const dashboardChannel1 = guild.channels.cache.find(ch => ch.id === settings.dashboardChannel1)
    if(queue?.songs?.length === playlist?.songs?.length) client.help(lang, dashboardChannel1)
    else {
        client.updateDashboard(queue, settings, lang, dashboardChannel1)
        client.sendCorrect(dashboardChannel1, `${lang.SONG_ADDED_TO_QUEUE2}`)
    }
}