module.exports = async (client, queue) => {
    const guild = queue.textChannel.guild
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.dashboard1.language}`)

    if(queue.playing) {
        client.distube.pause(queue)
        client.updateDashboard(guild, queue, lang)
    }
}