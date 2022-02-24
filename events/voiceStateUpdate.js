module.exports = async (client, oldState, newState) => {
    const guild = newState.guild

    if(!client.cooldown(guild.id + "voiceUpdate", 60000)) {
        setTimeout(async () => {
            const settings = await client.getGuild(guild)
            const voiceId = guild.me.voice.channel?.id || ""
            if(settings.flopy1.channel !== client.config.GUILD_DEFAULTSETTINGS.flopy1.channel && voiceId !== settings.flopy1.voice) client.updateGuild(guild, { flopy1: { channel: settings.flopy1.channel, message: settings.flopy1.message, voice: voiceId, language: settings.flopy1.language } })
        }, 60000)
    }
}