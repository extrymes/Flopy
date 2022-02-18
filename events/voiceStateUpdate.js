const cooldown = {}

module.exports = async (client, oldState, newState) => {
    const guild = newState.guild

    if(!cooldown[guild.id]) {
        cooldown[guild.id] = true
        setTimeout(async () => {
            cooldown[guild.id] = undefined
            const settings = await client.getGuild(guild)
            const voiceId = guild.me.voice.channel?.id || ""
            if(settings.flopy1.channel !== client.config.GUILD_DEFAULTSETTINGS.flopy1.channel && voiceId !== settings.flopy1.voice) client.updateGuild(guild, { flopy1: { channel: settings.flopy1.channel, message: settings.flopy1.message, voice: voiceId, language: settings.flopy1.language } })
        }, client.config.VOICE_UPDATE_COOLDOWN * 1000)
    }
}