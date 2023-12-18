const { SlashCommandBuilder } = require("discord.js");
const languages = require("../utils/languages");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("seek")
    .setDescription(`${languages["en"].COMMAND_SEEK_DESCRIPTION}`)
    .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_SEEK_DESCRIPTION}` })
    .setDMPermission(false)
    .addIntegerOption((option) =>
      option
      .setName("hhmmss")
      .setDescription(`${languages["en"].COMMAND_SEEK_OPTION}`)
      .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_SEEK_OPTION}` })
      .setRequired(true)
    ),
  run: async (client, interaction, guildData, queue, lang) => {
    const { guild, member, options } = interaction;
    const currentSong = queue?.songs[0];
    const hhmmss = options.getInteger("hhmmss").toString();
    
    if(!currentSong) return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_NO_PLAYING}`);
    if(!client.checkMemberIsInMyVoiceChannel(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
    if(currentSong.isLive) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
    const sec = client.convertHHMMSSToSeconds(hhmmss);
    if(sec > currentSong.duration) return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_TIME_GREATER}`);
    if(!client.manageCooldown("seekCommand", guild.id, 4000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
    await interaction.deferReply().catch((error) => { });
    try {
      // Seek in current song
      await client.distube.seek(queue, sec);
      // Resume queue and update dashboard message if paused
      if(queue.paused) {
        client.distube.resume(queue);
        client.editDashboardMessage(guild, queue, lang);
      }
      // Create duration bar
      const durationBar = client.createDurationBar(queue);
      // Send notification
      client.sendNotification(interaction, `${durationBar}`, { editReply: true });
    } catch (error) {
      const errorMessage = client.getErrorMessage(error.message, lang);
      client.sendErrorNotification(interaction, `${errorMessage}`, { editReply: true });
    }
  }
}