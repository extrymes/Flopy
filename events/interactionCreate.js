const languages = require("../utils/languages");

module.exports = async (client, interaction) => {
  const { guild, channel, member } = interaction;
  const guildData = await client.getGuildData(guild);
  const queue = client.distube.getQueue(guild);
  const lang = languages[guildData.language];

  if (interaction.isCommand()) {
    // Check if command is executed in dashboard channel
    if (channel !== client.dashboards[guild.id]?.channel && interaction.commandName !== "setup") return client.sendErrorNotification(interaction, `${lang.ERROR_COMMAND_NOT_USABLE}`);
    // Run command
    const command = require(`../commands/${interaction.commandName}`);
    return command.run(client, interaction, guildData, queue, lang);
  }
  switch (interaction.customId) {
    case "resume":
      if (!client.checkMemberIsInMyVoiceChannel(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
      // Resume queue and update dashboard message
      try {
        client.distube.resume(queue);
        client.editDashboardMessage(guild, queue, lang);
      } catch (error) { }
      interaction.deferUpdate().catch((error) => { });
      break;
    case "pause":
      if (!client.checkMemberIsInMyVoiceChannel(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
      // Pause queue and update dashboard message
      try {
        client.distube.pause(queue);
        client.editDashboardMessage(guild, queue, lang);
      } catch (error) { }
      interaction.deferUpdate().catch((error) => { });
      break;
    case "stop":
      if (!client.checkMemberIsInMyVoiceChannel(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
      // Stop queue
      try { client.distube.stop(queue) } catch (error) { }
      interaction.deferUpdate().catch((error) => { });
      break;
    case "skip":
      if (!client.checkMemberIsInMyVoiceChannel(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
      // Skip to next song and resume queue if paused
      try {
        client.distube.skip(queue).catch((error) => { });
        if (queue.paused && (queue.songs[1] || queue.autoplay)) client.distube.resume(queue);
      } catch (error) { }
      interaction.deferUpdate().catch((error) => { });
      break;
    case "repeat":
      if (!client.checkMemberIsInMyVoiceChannel(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
      // Switch repeat mode and update dashboard message
      try {
        client.distube.setRepeatMode(queue, queue.repeatMode === 0 ? 1 : queue.repeatMode === 1 ? 2 : 0);
        client.editDashboardMessage(guild, queue, lang);
      } catch (error) { }
      interaction.deferUpdate().catch((error) => { });
      break;
    case "volume":
      if (!client.checkMemberIsInMyVoiceChannel(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
      // Switch volume and update dashboard message
      try {
        client.distube.setVolume(queue, queue.volume === 50 ? 25 : queue.volume === 25 ? 75 : queue.volume === 75 ? 100 : 50);
        client.editDashboardMessage(guild, queue, lang);
      } catch (error) { }
      interaction.deferUpdate().catch((error) => { });
      break;
    case "play":
      const url = interaction.values[0];
      if (!member.voice.channel) return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_VOICE_CHANNEL}`);
      if (!client.checkMemberIsInMyVoiceChannel(guild, member) && queue) return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
      if (!client.manageCooldown("playQuery", member.id, 2000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
      // Play or add item to the queue
      await interaction.deferReply().catch((error) => { });
      client.distube.play(member.voice.channel, url, { textChannel: channel, member: member, metadata: interaction }).catch((error) => {
        const errorMessage = client.getErrorMessage(error.message, lang);
        client.sendErrorNotification(interaction, `${errorMessage}`, { editReply: true });
      });
      break;
    default:
      client.sendErrorNotification(interaction, `${lang.ERROR_UNKNOWN}`);
  }
}