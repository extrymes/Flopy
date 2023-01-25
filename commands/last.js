const { SlashCommandBuilder } = require("discord.js")
const languages = require("../utils/languages")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("last")
        .setDescription(`${languages["en"].COMMAND_LAST_DESCRIPTION}`)
        .setDescriptionLocalizations({ "fr": `${languages["en"].COMMAND_LAST_DESCRIPTION}` })
        .setDMPermission(false),
    run: async (client, interaction, settings, queue, lang) => {
        const { guild, channel, member } = interaction
        
        if(!member.voice.channel) return client.sendErrorNotification(interaction, `${lang.ERROR_USER_MUST_JOIN_VOICE}`)
        if(!client.checkVoice(guild, member) && queue) return client.sendErrorNotification(interaction, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`)
        if(!client.manageCooldown("play", member.id, 2000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`)
        await interaction.deferReply().catch(error => {})
        client.distube.play(member.voice.channel, client.queries.get(member.id), { textChannel: channel, member: member, metadata: interaction }).catch(error => {
            const errorMessage = client.getErrorMessage(error.message, lang)
            client.sendErrorNotification(interaction, `${errorMessage}`, true)
        })
    }
}