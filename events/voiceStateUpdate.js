module.exports = async (client, oldState, newState) => {
    const { guild, channel: newVoice, member } = newState
    const oldVoice = oldState.channel

    if(member === guild.me) {
        if(!newVoice && !client.cooldown("join" + guild.id, 5000)) try { client.distube.voices.join(oldVoice) } catch {}
        if(!client.cooldown("voiceUpdate" + guild.id, 30000)) {
            setTimeout(async () => {
                const settings = await client.getGuild(guild)
                const voiceId = guild.me.voice.channel?.id || ""
                if(settings.flopy1.channel !== client.config.GUILD_DEFAULTSETTINGS.flopy1.channel && voiceId !== settings.flopy1.voice) client.updateGuild(guild, { flopy1: { channel: settings.flopy1.channel, message: settings.flopy1.message, voice: voiceId, language: settings.flopy1.language } })
            }, 30000)
        }
    }
}