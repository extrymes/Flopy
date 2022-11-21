const elements = require("../util/elements")
const languages = require("../util/languages")

module.exports.run = async (client, interaction, settings, queue, lang) => {
    const { guild, channel, member, options } = interaction
    const language = options.getString("language")

    if(!client.checkManager(member)) return client.replyError(interaction, false, `${lang.ERROR_USER_NO_MANAGER}`)
    if(!client.checkSendable(guild, channel)) return client.replyError(interaction, false, `${lang.ERROR_DASHBOARD_UNABLE_SETUP}`)
    if(client.cooldown("setup" + guild.id, 4000)) return client.replyError(interaction, false, `${lang.ERROR_ACTION_TOO_FAST}`)
    await interaction.deferReply().catch(error => {})
    if(language !== settings.flopy1.language) client.updateGuild(guild, { flopy1: Object.assign(settings.flopy1, { language: language }) })
    client.sendDashboard(guild, channel, settings, queue, languages[language])
    interaction.deleteReply().catch(error => {})
}
module.exports.data = {
    name: "setup",
    description: languages["en"].COMMAND_SETUP_DESCRIPTION,
    description_localizations: { "fr": languages["fr"].COMMAND_SETUP_DESCRIPTION },
    options: [
        {
            name: "language",
            description: languages["en"].COMMAND_SETUP_OPTION,
            description_localizations: { "fr": languages["fr"].COMMAND_SETUP_OPTION },
            type: 3,
            required: true,
            choices: [
                {
                    name: `${elements.EMOJI_LANG_EN} English`,
                    value: "en",
                },
                {
                    name: `${elements.EMOJI_LANG_FR} Français`,
                    value: "fr",
                },
            ],
        },
    ],
    dm_permission: false,
}