const languages = require("../util/languages")

module.exports = async (client, interaction) => {
    const { guild, channel, message, member } = interaction
    const settings = await client.getGuild(guild)
    const queue = client.distube.getQueue(guild)
    const lang = languages[settings.flopy1.language]

    if(interaction.isCommand()) {
        if(channel === client.cache["dashboard" + guild.id]?.channel || interaction.commandName === "setup" ) {
            const command = client.commands.get(interaction.commandName)
            command.run(client, interaction, settings, queue, lang)
        } else client.replyError(interaction, false, `${lang.ERROR_COMMAND_NOT_USABLE}`)
    } else {
        switch(interaction.customId) {
            case "resume":
                if(client.checkVoice(guild, member)) {
                    try {
                        client.distube.resume(queue)
                        client.editDashboard(guild, queue, lang)
                    } catch {}
                    interaction.deferUpdate().catch(error => {})
                } else client.replyError(interaction, false, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`)
                break
            case "pause":
                if(client.checkVoice(guild, member)) {
                    try {
                        client.distube.pause(queue)
                        client.editDashboard(guild, queue, lang)
                    } catch {}
                    interaction.deferUpdate().catch(error => {})
                } else client.replyError(interaction, false, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`)
                break
            case "stop":
                if(client.checkVoice(guild, member)) {
                    try { client.distube.stop(queue) } catch {}
                    interaction.deferUpdate().catch(error => {})
                } else client.replyError(interaction, false, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`)
                break
            case "skip":
                if(client.checkVoice(guild, member)) {
                    try {
                        client.distube.skip(queue).catch(error => {})
                        if(queue.paused && (queue.songs[1] || queue.autoplay)) client.distube.resume(queue)
                    } catch {}
                    interaction.deferUpdate().catch(error => {})
                } else client.replyError(interaction, false, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`)
                break
            case "repeat":
                if(client.checkVoice(guild, member)) {
                    try {
                        client.distube.setRepeatMode(queue, queue.repeatMode === 0 ? 1 : queue.repeatMode === 1 ? 2 : 0)
                        client.editDashboard(guild, queue, lang)
                    } catch {}
                    interaction.deferUpdate().catch(error => {})
                } else client.replyError(interaction, false, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`)
                break
            case "volume":
                if(client.checkVoice(guild, member)) {
                    try {
                        client.distube.setVolume(queue, queue.volume === 50 ? 25 : queue.volume === 25 ? 75 : queue.volume === 75 ? 100 : 50)
                        client.editDashboard(guild, queue, lang)
                    } catch {}
                    interaction.deferUpdate().catch(error => {})
                } else client.replyError(interaction, false, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`)
                break
            case "play":
                const url = interaction.values[0]
                if(member.voice.channel) {
                    if(client.checkVoice(guild, member) || !queue) {
                        if(!client.cooldown("play" + member.id, 2000)) {
                            await interaction.deferReply().catch(error => {})
                            client.distube.play(member.voice.channel, url, { textChannel: channel, member: member, metadata: { interaction: interaction } }).catch(error => {
                                const errorMessage = client.getErrorMessage(error.message, lang)
                                client.replyError(interaction, true, `${errorMessage}`)
                            })
                        } else client.replyError(interaction, false, `${lang.ERROR_ACTION_NOT_POSSIBLE}`)
                    } else client.replyError(interaction, false, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`)
                } else client.replyError(interaction, false, `${lang.ERROR_USER_MUST_JOIN_VOICE}`)
                break
            default:
                client.replyError(interaction, false, `${lang.ERROR_OCCURED}`)
        }
    }
}