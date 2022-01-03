module.exports = async (client, interaction) => {
    const guild = interaction.guild
    const queue = client.distube.getQueue(guild)
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.dashboard1.language}`)

    eval(interaction.customId)

    async function Lang(langID) {
        const newLang = require(`../util/lang/${langID}`)
        client.updateGuild(guild, { dashboard1: { channel: settings.dashboard1.channel, message: settings.dashboard1.message, language: langID } })
        client.updateDashboard(guild, queue, newLang)
        interaction.deferUpdate().catch(error => {})
    }

    async function PlayPause() {
        if(client.checkChannel(guild, interaction.member)) {
            if(queue.playing) client.distube.pause(queue)
            else client.distube.resume(queue)
            client.updateDashboard(guild, queue, lang)
            interaction.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    }

    async function Stop() {
        if(client.checkChannel(guild, interaction.member)) {
            client.distube.stop(queue)
            interaction.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    }

    async function Skip() {
        if(client.checkChannel(guild, interaction.member)) {
            client.distube.skip(queue).catch(error => {})
            if(queue.songs.length - 1 > 0 && queue.paused) client.distube.resume(queue)
            interaction.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    }

    async function Repeat() {
        if(client.checkChannel(guild, interaction.member)) {
            client.distube.setRepeatMode(queue, queue.repeatMode === 0 ? 1 : queue.repeatMode === 1 ? 2 : 0)
            client.updateDashboard(guild, queue, lang)
            interaction.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    }

    async function Volume() {
        if(client.checkChannel(guild, interaction.member)) {
            client.distube.setVolume(queue, queue.volume === 50 ? 25 : queue.volume === 25 ? 75 : queue.volume === 75 ? 100 : 50)
            client.updateDashboard(guild, queue, lang)
            interaction.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    }

    async function Hide() {
        interaction.message.delete().catch(error => {})
    }
}