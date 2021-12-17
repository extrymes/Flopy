module.exports = async (client, queue, song) => {
    const guild = queue.textChannel.guild
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.dashboard1.language}`)
    
    client.updateDashboard(guild, queue, lang)
}