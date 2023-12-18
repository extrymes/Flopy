const { SlashCommandBuilder } = require("discord.js");
const languages = require("../utils/languages");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("replay")
    .setDescription(`${languages["en"].COMMAND_REPLAY_DESCRIPTION}`)
    .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_REPLAY_DESCRIPTION}` })
    .setDMPermission(false),
  run: async (client, interaction, guildData, queue, lang) => {
    const { guild, member } = interaction;
    const currentSong = queue?.songs[0];

    if (!currentSong) return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_NO_PLAYING}`);
    if (!client.checkMemberIsInMyVoiceChannel(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
    if (currentSong.isLive) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
    if (!client.manageCooldown("replayCommand", guild.id, 4000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
    await interaction.deferReply().catch((error) => { });
    try {
      // Replay current song
      await client.distube.seek(queue, 0);
      // Resume and update dashboard message if queue is paused
      if (queue.paused) {
        client.distube.resume(queue);
        client.editDashboardMessage(guild, queue, lang);
      }
      // Send advanced notification
      client.sendAdvancedNotification(interaction, `${lang.MESSAGE_SONG_REPLAYED}`, `${currentSong.name}`, currentSong.thumbnail, { editReply: true });
    } catch (error) {
      const errorMessage = client.getErrorMessage(error.message, lang);
      client.sendErrorNotification(interaction, `${errorMessage}`, { editReply: true });
    }
  }
}