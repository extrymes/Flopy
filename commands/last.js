const languages = require("../util/languages")

module.exports.run = async (client, interaction, settings, queue, lang) => {
    const { guild, channel, member } = interaction

    if(!member.voice.channel) return client.replyError(interaction, false, `${lang.ERROR_USER_MUST_JOIN_VOICE}`)
    if(!client.checkVoice(guild, member) && queue) return client.replyError(interaction, false, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`)
    if(client.cooldown("play" + member.id, 2000)) return client.replyError(interaction, false, `${lang.ERROR_ACTION_NOT_POSSIBLE}`)
    await interaction.deferReply().catch(error => {})
    client.distube.play(member.voice.channel, client.cache["query" + member.id], { textChannel: channel, member: member, metadata: { interaction: interaction } }).catch(error => {
        const errorMessage = client.getErrorMessage(error.message, lang)
        client.replyError(interaction, true, `${errorMessage}`)
    })
}
module.exports.data = {
    name: "last",
    description: languages["en"].COMMAND_LAST_DESCRIPTION,
    description_localizations: { "fr": languages["fr"].COMMAND_LAST_DESCRIPTION },
    dm_permission: false,
}