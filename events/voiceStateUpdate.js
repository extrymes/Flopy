module.exports = async (client, oldState, newState) => {
  const { guild, channel: newVoiceChannel, member } = newState;
  const oldVoiceChannel = oldState.channel;

  if (member === guild.members.me) {
    if (!newVoiceChannel) {
      client.distube.voices.leave(guild);
      if (client.manageCooldown("joinVoice", guild.id, 5000)) try { client.distube.voices.join(oldVoiceChannel).catch((error) => { }) } catch (error) { }
    }
    if (client.manageCooldown("updateVoice", guild.id, client.config.VOICE_UPDATE_COOLDOWN * 1000)) {
      setTimeout(async () => {
        if (client.dashboards.has(guild.id)) {
          const voiceId = member.voice.channel?.id || "";
          const settings = await client.getGuildData(guild);
          if (voiceId !== settings.flopy1.voice) client.updateGuildData(guild, { flopy1: Object.assign(settings.flopy1, { voice: voiceId }) });
        } else client.leaveVoiceChannel(guild);
      }, client.config.VOICE_UPDATE_COOLDOWN * 1000);
    }
  }
}