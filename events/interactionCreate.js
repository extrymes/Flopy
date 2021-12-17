module.exports = async (client, interaction) => {
    const guild = interaction.guild
    const queue = client.distube.getQueue(guild)
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.dashboard1.language}`)
    const clientChannel = guild.me.voice.channel
    const memberChannel = interaction.member.voice.channel

    eval(interaction.customId)

    async function Lang(langID) {
        const newLang = require(`../util/lang/${langID}`)
        client.updateGuild(guild, { dashboard1: { channel: settings.dashboard1.channel, message: settings.dashboard1.message, language: langID } })
        client.updateDashboard(guild, queue, newLang)
        interaction.deferUpdate().catch(error => {})
    }

    async function PlayPause() {
        if(clientChannel?.id === memberChannel?.id) {
            client.playPauseSong(guild, queue, lang)
            interaction.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    }

    async function Stop() {
        if(clientChannel?.id === memberChannel?.id) {
            client.stopSong(queue)
            interaction.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    }

    async function Skip() {
        if(clientChannel?.id === memberChannel?.id) {
            client.skipSong(queue)
            interaction.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    }

    async function Repeat() {
        if(clientChannel?.id === memberChannel?.id) {
            client.repeatSong(guild, queue, lang)
            interaction.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    }

    async function Volume() {
        if(clientChannel?.id === memberChannel?.id) {
            client.volumeSong(guild, queue, lang)
            interaction.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    }

    async function Seek() {
        if(clientChannel?.id === memberChannel?.id) {
            client.seekSong(queue, lang, interaction.channel, Number(interaction.values[0]))
            interaction.message.delete().catch(error => {})
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    }
}