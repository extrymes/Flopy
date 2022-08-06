const languages = require("../util/languages")

module.exports = async (client, queue, song) => {
    const guild = queue.textChannel.guild
    const settings = await client.getGuild(guild)
    const lang = languages[settings.flopy1.language]

    if(queue.paused) client.distube.resume(queue)
    if(Date.now() - client.cache["dashboard" + guild.id]?.createdTimestamp < client.config.DASHBOARD_MAX_LIFE * 1000) client.updateDashboard(guild, queue, lang)
    else client.refreshDashboard(guild, settings, queue, lang)
}