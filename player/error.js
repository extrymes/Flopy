const languages = require("../util/languages")

module.exports = async (client, channel, error) => {
    const guild = channel.guild
    const settings = await client.getGuild(guild)
    const lang = languages[settings.flopy1.language]

    const errorMessage = client.getErrorMessage(error.message, lang)
    client.sendError(channel, `${errorMessage}`)
}