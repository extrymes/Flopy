module.exports = async (client, interaction) => {
    const { guild, channel, message, member } = interaction
    const settings = await client.getGuild(guild)
    const queue = client.distube.getQueue(guild)
    const lang = require(`../util/lang/${settings.flopy1.language}`)

    eval(interaction.customId + "()")

    function Resume() {
        if(client.checkVoice(guild, member)) {
            client.distube.resume(queue)
            client.updateDashboard(guild, queue, lang)
            interaction.deferUpdate()
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_VOICE_2}`)
    }

    function Pause() {
        if(client.checkVoice(guild, member)) {
            client.distube.pause(queue)
            client.updateDashboard(guild, queue, lang)
            interaction.deferUpdate()
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_VOICE_2}`)
    }

    function Stop() {
        if(client.checkVoice(guild, member)) {
            client.distube.stop(queue)
            interaction.deferUpdate()
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_VOICE_2}`)
    }

    function Skip() {
        if(client.checkVoice(guild, member)) {
            client.distube.skip(queue).catch(error => {})
            if(queue.paused && (queue.songs[1] || queue.autoplay)) client.distube.resume(queue)
            interaction.deferUpdate()
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_VOICE_2}`)
    }

    function Repeat() {
        if(client.checkVoice(guild, member)) {
            client.distube.setRepeatMode(queue, queue.repeatMode === 0 ? 1 : queue.repeatMode === 1 ? 2 : 0)
            client.updateDashboard(guild, queue, lang)
            interaction.deferUpdate()
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_VOICE_2}`)
    }

    function Volume() {
        if(client.checkVoice(guild, member)) {
            client.distube.setVolume(queue, queue.volume === 50 ? 25 : queue.volume === 25 ? 75 : queue.volume === 75 ? 100 : 50)
            client.updateDashboard(guild, queue, lang)
            interaction.deferUpdate()
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_VOICE_2}`)
    }

    function PlaySong() {
        const url = interaction.values[0]
        if(member.voice.channel) {
            if(client.checkVoice(guild, member) || !queue) {
                message.delete().catch(error => {})
                channel.sendTyping().catch(error => {})
                if(!client.checkVoice(guild, member)) client.leaveVoice(guild)
                try { client.distube.play(member.voice.channel, url, { textChannel: channel, member: member }) } catch(error) { client.distube.emit("error", channel, error) }
            } else client.replyError(interaction, `${lang.ERROR_USER_NO_VOICE_2}`)
        } else client.replyError(interaction, `${lang.ERROR_USER_NO_VOICE}`)
    }

    function LangEn() {
        const newLang = require("../util/lang/en")
        client.updateGuild(guild, { flopy1: Object.assign(settings.flopy1, { "language": "en" }) })
        client.updateDashboard(guild, queue, newLang)
        interaction.deferUpdate()
    }

    function LangFr() {
        const newLang = require("../util/lang/fr")
        client.updateGuild(guild, { flopy1: Object.assign(settings.flopy1, { "language": "fr" }) })
        client.updateDashboard(guild, queue, newLang)
        interaction.deferUpdate()
    }

    function Hide() {
        message.delete().catch(error => {})
    }
}