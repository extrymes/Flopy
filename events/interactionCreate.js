module.exports = async (client, interaction) => {
    const guild = interaction.guild
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.language}`)
    const clientChannel = guild.members.cache.get(client.user.id).voice.channel
    const memberChannel = interaction.member.voice.channel

    eval(interaction.customId)

    async function Lang(langID) {
        await client.updateGuild(guild, { language: langID })
        client.updateDashboard(guild, settings, lang, interaction.channel)
        interaction?.deferUpdate().catch(error => {})
    }

    async function PlayPause() {
        if(clientChannel?.id === memberChannel?.id) {
            client.musicPlayPause(guild, settings, lang, interaction.channel)
            interaction?.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.USER_NO_CORRECT_VOICE_CHANNEL}`)
    }

    async function Stop() {
        if(clientChannel?.id === memberChannel?.id) {
            client.musicStop(guild, settings, lang, interaction.channel)
            interaction?.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.USER_NO_CORRECT_VOICE_CHANNEL}`)
    }

    async function Skip() {
        if(clientChannel?.id === memberChannel?.id) {
            client.musicSkip(guild)
            interaction?.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.USER_NO_CORRECT_VOICE_CHANNEL}`)
    }

    async function Repeat() {
        if(clientChannel?.id === memberChannel?.id) {
            client.musicRepeat(guild, settings, lang, interaction.channel)
            interaction?.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.USER_NO_CORRECT_VOICE_CHANNEL}`)
    }

    async function Volume() {
        if(clientChannel?.id === memberChannel?.id) {
            client.musicVolume(guild, settings, lang, interaction.channel)
            interaction?.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.USER_NO_CORRECT_VOICE_CHANNEL}`)
    }
}