module.exports = async (client, oldState, newState) => {
  const { guild, channel: newVoiceChannel, member } = newState;
  const oldVoiceChannel = oldState.channel;
  const queue = client.distube.getQueue(guild);

  if (member === guild.members.me) {
    if (!newVoiceChannel) {
      client.distube.voices.leave(guild);
      if (client.manageCooldown("joinVoiceChannel", guild.id, 5000)) try { client.distube.voices.join(oldVoiceChannel).catch((error) => { }) } catch (error) { }
    }
    if (client.manageCooldown("updateVoiceChannel", guild.id, client.config.VOICE_CHANNEL_UPDATE_COOLDOWN * 1000)) {
      setTimeout(async () => {
        if (client.dashboards[guild.id]) {
          const voiceId = member.voice.channel?.id || "";
          const guildData = await client.getGuildData(guild);
          if (voiceId !== guildData.voice) client.updateGuildData(guild, { voice: voiceId });
        } else client.leaveVoiceChannel(guild);
      }, client.config.VOICE_CHANNEL_UPDATE_COOLDOWN * 1000);
    }
  }
  if (queue) {
    const currentTimeout = client.emptyTimeouts[guild.id];
    const isEmpty = client.checkMyVoiceChannelIsEmpty(guild);
    if (!currentTimeout && isEmpty) {
      client.emptyTimeouts[guild.id] = setTimeout(async () => {
        delete client.emptyTimeouts[guild.id];
        try { client.distube.stop(queue) } catch (error) { }
      }, client.config.VOICE_CHANNEL_EMPTY_TIMEOUT * 1000);
    } else if (currentTimeout && !isEmpty) {
      clearTimeout(currentTimeout);
      delete client.emptyTimeouts[guild.id];
    }
  }
}