module.exports = async (client, interaction) => {
    const { guild, channel, message, member } = interaction
    const settings = await client.getGuild(guild)
    const queue = client.distube.getQueue(guild)
    const lang = require(`../util/lang/${settings.flopy1.language}`)

    switch(interaction.customId) {
        case "resume":
            if(client.checkVoice(guild, member)) {
                try {
                    client.distube.resume(queue)
                    client.updateDashboard(guild, queue, lang)
                } catch {}
                interaction.deferUpdate()
            } else client.replyError(interaction, `${lang.ERROR_USER_NO_VOICE_2}`)
            break
        case "pause":
            if(client.checkVoice(guild, member)) {
                try {
                    client.distube.pause(queue)
                    client.updateDashboard(guild, queue, lang)
                } catch {}
                interaction.deferUpdate()
            } else client.replyError(interaction, `${lang.ERROR_USER_NO_VOICE_2}`)
            break
        case "stop":
            if(client.checkVoice(guild, member)) {
                try { client.distube.stop(queue) } catch {}
                interaction.deferUpdate()
            } else client.replyError(interaction, `${lang.ERROR_USER_NO_VOICE_2}`)
            break
        case "skip":
            if(client.checkVoice(guild, member)) {
                try {
                    client.distube.skip(queue).catch(error => {})
                    if(queue.paused && (queue.songs[1] || queue.autoplay)) client.distube.resume(queue)
                } catch {}
                interaction.deferUpdate()
            } else client.replyError(interaction, `${lang.ERROR_USER_NO_VOICE_2}`)
            break
        case "repeat":
            if(client.checkVoice(guild, member)) {
                try {
                    client.distube.setRepeatMode(queue, queue.repeatMode === 0 ? 1 : queue.repeatMode === 1 ? 2 : 0)
                    client.updateDashboard(guild, queue, lang)
                } catch {}
                interaction.deferUpdate()
            } else client.replyError(interaction, `${lang.ERROR_USER_NO_VOICE_2}`)
            break
        case "volume":
            if(client.checkVoice(guild, member)) {
                try {
                    client.distube.setVolume(queue, queue.volume === 50 ? 25 : queue.volume === 25 ? 75 : queue.volume === 75 ? 100 : 50)
                    client.updateDashboard(guild, queue, lang)
                } catch {}
                interaction.deferUpdate()
            } else client.replyError(interaction, `${lang.ERROR_USER_NO_VOICE_2}`)
            break
        case "play":
            const url = interaction.values[0]
            if(member.voice.channel) {
                if(client.checkVoice(guild, member) || !guild.me.voice.channel) {
                    message.delete().catch(error => {})
                    channel.sendTyping().catch(error => {})
                    try { client.distube.play(member.voice.channel, url, { textChannel: channel, member: member }) } catch(error) { client.distube.emit("error", channel, error) }
                } else client.replyError(interaction, `${lang.ERROR_USER_NO_VOICE_2}`)
            } else client.replyError(interaction, `${lang.ERROR_USER_NO_VOICE}`)
            break
        case "lang_en":
            const en = require("../util/lang/en")
            client.updateGuild(guild, { flopy1: Object.assign(settings.flopy1, { "language": "en" }) })
            client.updateDashboard(guild, queue, en)
            interaction.deferUpdate()
            break
        case "lang_fr":
            const fr = require("../util/lang/fr")
            client.updateGuild(guild, { flopy1: Object.assign(settings.flopy1, { "language": "fr" }) })
            client.updateDashboard(guild, queue, fr)
            interaction.deferUpdate()
            break
        case "hide":
            message.delete().catch(error => {})
            break
        default:
            client.replyError(interaction, `${lang.ERROR_OCCURED}`)
    }
}