const languages = require("../util/languages")

module.exports.run = async (client, interaction, settings, queue, lang) => {
    const { guild, channel, member, options } = interaction
    const query = options.getString("query")

    if(!member.voice.channel) return client.replyError(interaction, false, `${lang.ERROR_USER_NO_VOICE}`)
    if(!client.checkVoice(guild, member) && queue) return client.replyError(interaction, false, `${lang.ERROR_USER_NO_VOICE_2}`)
    if(client.cooldown("play" + member.id, 2000)) return client.replyError(interaction, false, `${lang.ERROR_ACTION_TOO_FAST}`)
    await interaction.deferReply()
    client.distube.play(member.voice.channel, query, { textChannel: channel, member: member, metadata: { interaction: interaction }, position: 1 }).catch(error => {
        const errorMessage = client.getErrorMessage(error.message, lang)
        client.replyError(interaction, true, `${errorMessage}`)
    })
}
module.exports.data = {
    name: "first",
    description: languages["en"].COMMAND_FIRST_DESCRIPTION,
    description_localizations: { "fr": languages["fr"].COMMAND_FIRST_DESCRIPTION },
    options: [
        {
            name: "query",
            description: languages["en"].COMMAND_FIRST_OPTION,
            description_localizations: { "fr": languages["fr"].COMMAND_FIRST_OPTION },
            type: 3,
            required: true,
        },
    ],
    dm_permission: false,
}