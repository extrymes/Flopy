const { SlashCommandBuilder } = require("discord.js");
const languages = require("../utils/languages");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("autoplay")
    .setDescription(`${languages["en"].COMMAND_AUTOPLAY_DESCRIPTION}`)
    .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_AUTOPLAY_DESCRIPTION}` })
    .setDMPermission(false),
  run: async (client, interaction, settings, queue, lang) => {
    const { guild, member } = interaction;
    
    if(!queue?.songs[0]) return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_NO_PLAYING}`);
    if(!client.checkVoice(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`);
    if(!client.manageCooldown("autoplay", guild.id, 2000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
    const autoplay = client.distube.toggleAutoplay(queue);
    client.editDashboard(guild, queue, lang);
    client.sendNotification(interaction, `${autoplay ? lang.MESSAGE_AUTOPLAY_ENABLED : lang.MESSAGE_AUTOPLAY_DISABLED}`);
  }
}