const languages = require("../utils/languages");

module.exports = async (client, interaction) => {
  const { guild, channel, member } = interaction;
  const guildData = await client.getGuildData(guild);
  const queue = client.distube.getQueue(guild);
  const lang = languages[guildData.language];

  if (interaction.isCommand()) {
    if (channel === client.dashboards.get(guild.id)?.channel || interaction.commandName === "setup") {
      const command = require(`../commands/${interaction.commandName}`);
      command.run(client, interaction, guildData, queue, lang);
    } else client.sendErrorNotification(interaction, `${lang.ERROR_COMMAND_NOT_USABLE}`);
  } else {
    switch (interaction.customId) {
      case "resume":
        if (client.checkMemberIsInMyVoiceChannel(guild, member)) {
          try {
            client.distube.resume(queue);
            client.editDashboard(guild, queue, lang);
          } catch (error) { }
          interaction.deferUpdate().catch((error) => { });
        } else client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
        break;
      case "pause":
        if (client.checkMemberIsInMyVoiceChannel(guild, member)) {
          try {
            client.distube.pause(queue);
            client.editDashboard(guild, queue, lang);
          } catch (error) { }
          interaction.deferUpdate().catch((error) => { });
        } else client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
        break;
      case "stop":
        if (client.checkMemberIsInMyVoiceChannel(guild, member)) {
          try { client.distube.stop(queue) } catch (error) { }
          interaction.deferUpdate().catch((error) => { });
        } else client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
        break;
      case "skip":
        if (client.checkMemberIsInMyVoiceChannel(guild, member)) {
          try {
            client.distube.skip(queue).catch((error) => { });
            if (queue.paused && (queue.songs[1] || queue.autoplay)) client.distube.resume(queue);
          } catch (error) { }
          interaction.deferUpdate().catch((error) => { });
        } else client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
        break;
      case "repeat":
        if (client.checkMemberIsInMyVoiceChannel(guild, member)) {
          try {
            client.distube.setRepeatMode(queue, queue.repeatMode === 0 ? 1 : queue.repeatMode === 1 ? 2 : 0);
            client.editDashboard(guild, queue, lang);
          } catch (error) { }
          interaction.deferUpdate().catch((error) => { });
        } else client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
        break;
      case "volume":
        if (client.checkMemberIsInMyVoiceChannel(guild, member)) {
          try {
            client.distube.setVolume(queue, queue.volume === 50 ? 25 : queue.volume === 25 ? 75 : queue.volume === 75 ? 100 : 50);
            client.editDashboard(guild, queue, lang);
          } catch (error) { }
          interaction.deferUpdate().catch((error) => { });
        } else client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
        break;
      case "play":
        const url = interaction.values[0];
        if (member.voice.channel) {
          if (client.checkMemberIsInMyVoiceChannel(guild, member) || !queue) {
            if (client.manageCooldown("play", member.id, 2000)) {
              await interaction.deferReply().catch((error) => { });
              client.distube.play(member.voice.channel, url, { textChannel: channel, member: member, metadata: interaction }).catch((error) => {
                const errorMessage = client.getErrorMessage(error.message, lang);
                client.sendErrorNotification(interaction, `${errorMessage}`, true);
              });
            } else client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
          } else client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
        } else client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_VOICE_CHANNEL}`);
        break;
      default:
        client.sendErrorNotification(interaction, `${lang.ERROR_UNKNOWN}`);
    }
  }
}