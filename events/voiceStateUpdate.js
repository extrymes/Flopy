module.exports = async (client, oldState, newState) => {
    const { guild, channel: newVoice, member } = newState;
    const oldVoice = oldState.channel;

    if (member === guild.members.me) {
        if (!newVoice) {
            client.distube.voices.leave(guild);
            if (client.manageCooldown("joinVoice", guild.id, 5000)) try { client.distube.voices.join(oldVoice).catch((error) => { }) } catch { };
        }
        if (client.manageCooldown("updateVoice", guild.id, client.config.VOICE_UPDATE_COOLDOWN * 1000)) {
            setTimeout(async () => {
                if (client.dashboards.has(guild.id)) {
                    const voiceId = member.voice.channel?.id || "";
                    const settings = await client.getGuild(guild);
                    if (voiceId !== settings.flopy1.voice) client.updateGuild(guild, { flopy1: Object.assign(settings.flopy1, { voice: voiceId }) });
                } else client.leaveVoice(guild);
            }, client.config.VOICE_UPDATE_COOLDOWN * 1000);
        }
    }
}