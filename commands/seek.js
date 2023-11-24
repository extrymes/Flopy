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
  run: async (client, interaction, settings, queue, lang) => {
    const { guild, member, options } = interaction;
    const currentSong = queue?.songs[0];
    const hhmmss = options.getInteger("hhmmss").toString();
    
    if(!currentSong) return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_NO_PLAYING}`);
    if(!client.checkVoice(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`);
    if(currentSong.isLive) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
    const sec = client.convertHHMMSSToSeconds(hhmmss);
    if(sec > currentSong.duration) return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_TIME_GREATER}`);
    if(!client.manageCooldown("seek", guild.id, 4000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
    await client.distube.seek(queue, sec);
    if(queue.paused) {
      client.distube.resume(queue);
      client.editDashboard(guild, queue, lang);
    }
    const durationBar = client.createDurationBar(queue);
    client.sendNotification(interaction, `${durationBar}`);
  }
}