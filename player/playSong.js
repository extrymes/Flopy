const config = require("../admin/config");
const languages = require("../utils/languages");

module.exports = async (client, queue, song) => {
  const guild = queue.textChannel.guild;
  const channel = queue.textChannel;
  const guildData = await client.getGuildData(guild);
  const lang = languages[guildData.language];
  
  // Resume queue if paused
  if (queue.paused) client.distube.resume(queue);
  // Check whether to send a new dashboard message
  if (Date.now() - client.dashboards[guild.id]?.createdTimestamp < config.DASHBOARD_MESSAGE_MAX_LIFE * 1000) client.editDashboardMessage(guild, queue, lang);
  else {
    try {
      await client.sendDashboardMessage(guild, channel, queue, lang);
    } catch (error) {
      const errorMessage = client.getErrorMessage(error.message, lang);
      client.sendErrorNotification(channel, `${errorMessage}`);
      client.leaveVoiceChannel(guild);
    }
  }
}