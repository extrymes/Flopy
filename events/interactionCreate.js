module.exports = async (client, interaction) => {
    const guild = interaction.guild
    const channel = interaction.channel
    const message = interaction.message
    const member = interaction.member
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.flopy1.language}`)
    const queue = client.distube.getQueue(guild)

    eval(interaction.customId + "()")

    async function Play() {
        if(client.checkVoice(guild, member)) {
            if(queue.playing) client.distube.pause(queue)
            else client.distube.resume(queue)
            client.updateDashboard(guild, lang, queue)
            interaction.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_CORRECT_VOICE}`)
    }

    async function Stop() {
        if(client.checkVoice(guild, member)) {
            client.distube.stop(queue)
            interaction.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_CORRECT_VOICE}`)
    }

    async function Skip() {
        if(client.checkVoice(guild, member)) {
            client.distube.skip(queue).catch(error => {})
            if(queue.paused && queue.songs[1]) client.distube.resume(queue)
            interaction.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_CORRECT_VOICE}`)
    }

    async function Repeat() {
        if(client.checkVoice(guild, member)) {
            client.distube.setRepeatMode(queue, queue.repeatMode === 0 ? 1 : queue.repeatMode === 1 ? 2 : 0)
            client.updateDashboard(guild, lang, queue)
            interaction.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_CORRECT_VOICE}`)
    }

    async function Volume() {
        if(client.checkVoice(guild, member)) {
            client.distube.setVolume(queue, queue.volume === 50 ? 25 : queue.volume === 25 ? 75 : queue.volume === 75 ? 100 : 50)
            client.updateDashboard(guild, lang, queue)
            interaction.deferUpdate().catch(error => {})
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_CORRECT_VOICE}`)
    }

    async function PlaySong() {
        const url = interaction.values[0]
        if(member.voice.channel) {
            if(client.checkVoice(guild, member) || !queue) {
                message.delete().catch(error => {})
                channel.sendTyping().catch(error => {})
                if(!client.checkVoice(guild, member)) client.distube.voices.leave(guild)
                try { client.distube.play(member.voice.channel, url, { textChannel: channel, member: member }) } catch(error) { client.distube.emit("error", channel, error) }
            } else client.replyError(interaction, `${lang.ERROR_USER_NO_CORRECT_VOICE}`)
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_VOICE}`)
    }

    async function LangEn() {
        const newLang = require("../util/lang/en")
        client.updateGuild(guild, { flopy1: { channel: settings.flopy1.channel, message: settings.flopy1.message, voice: settings.flopy1.voice, language: "en" } })
        client.updateDashboard(guild, newLang, queue)
        interaction.deferUpdate().catch(error => {})
    }

    async function LangFr() {
        const newLang = require("../util/lang/fr")
        client.updateGuild(guild, { flopy1: { channel: settings.flopy1.channel, message: settings.flopy1.message, voice: settings.flopy1.voice, language: "fr" } })
        client.updateDashboard(guild, newLang, queue)
        interaction.deferUpdate().catch(error => {})
    }

    async function Hide() {
        message.delete().catch(error => {})
    }
}