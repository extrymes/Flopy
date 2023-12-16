const { SlashCommandBuilder } = require("discord.js");
const languages = require("../utils/languages");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription(`${languages["en"].COMMAND_JOIN_DESCRIPTION}`)
    .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_JOIN_DESCRIPTION}` })
    .setDMPermission(false),
  run: async (client, interaction, guildData, queue, lang) => {
    const { guild, member } = interaction
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_VOICE_CHANNEL}`);
    if (client.checkMemberIsInMyVoiceChannel(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_VOICE_CHANNEL_ALREADY_JOINED}`);
    if (!client.checkMyVoiceChannelIsEmpty(guild) && queue) return client.sendErrorNotification(interaction, `${lang.ERROR_VOICE_CHANNEL_UNABLE_JOIN}`);
    if (!client.manageCooldown("joinCommand", member.id, 2000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
    await interaction.deferReply().catch((error) => { });
    try {
      await client.distube.voices.join(voiceChannel);
      client.sendNotification(interaction, `${lang.MESSAGE_VOICE_CHANNEL_JOINED}`, { editReply: true });
    } catch (error) {
      const errorMessage = client.getErrorMessage(error.message, lang);
      client.sendErrorNotification(interaction, `${errorMessage}`, { editReply: true });
    }
  }
}