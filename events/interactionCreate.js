module.exports = async (client, interaction) => {
    const guild = interaction.guild
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.language}`)
    const queue = client.distube.getQueue(guild)
    const clientChannel = guild.me.voice.channel
    const memberChannel = interaction.member.voice.channel

    eval(interaction.customId)

    async function Lang(langID) {
        const newLang = require(`../util/lang/${langID}`)
        client.updateGuild(guild, { language: langID })
        client.updateDashboard(queue, settings, newLang, interaction.channel)
        interaction?.deferUpdate().catch(error => {})
    }

    async function PlayPause() {
        if(clientChannel?.id === memberChannel?.id) {
            client.songPlayPause(queue, settings, lang, interaction.channel)
            interaction?.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    }

    async function Stop() {
        if(clientChannel?.id === memberChannel?.id) {
            client.songStop(queue)
            interaction?.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    }

    async function Skip() {
        if(clientChannel?.id === memberChannel?.id) {
            client.songSkip(queue)
            interaction?.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    }

    async function Repeat() {
        if(clientChannel?.id === memberChannel?.id) {
            client.songRepeat(queue, settings, lang, interaction.channel)
            interaction?.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    }

    async function Volume() {
        if(clientChannel?.id === memberChannel?.id) {
            client.songVolume(queue, settings, lang, interaction.channel)
            interaction?.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    }
}