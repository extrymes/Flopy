const languages = require("../util/languages")

module.exports = async (client, queue) => {
    const guild = queue.textChannel.guild
    const settings = await client.getGuild(guild)
    const lang = languages[settings.flopy1.language]
    
    client.updateDashboard(guild, queue, lang)
}