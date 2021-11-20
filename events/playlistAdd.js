module.exports = async (client, queue, playlist) => {
    const guild = queue.guild
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.language}`)
    const dashboardChannel1 = guild.channels.cache.find(ch => ch.id === settings.dashboardChannel1)
    client.updateDashboard(guild, settings, lang, dashboardChannel1)
    if(queue?.songs?.length === playlist?.songs?.length) client.sendCommands(lang, dashboardChannel1)
    else client.sendCorrect(dashboardChannel1, `${lang.MUSIC_ADDED_TO_QUEUE2}`)
}