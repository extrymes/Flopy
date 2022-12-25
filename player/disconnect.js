const languages = require("../util/languages")

module.exports = async (client, queue) => {
    const guild = queue.textChannel.guild
    const channel = client.dashboards.get(guild.id)?.channel
    const settings = await client.getGuild(guild)
    const lang = languages[settings.flopy1.language]
    
    client.sendError(channel, `${lang.ERROR_VOICE_DISCONNECTED}`)
}