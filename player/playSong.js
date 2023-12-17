const languages = require("../utils/languages");

module.exports = async (client, queue, song) => {
  const guild = queue.textChannel.guild;
  const channel = client.dashboards[guild.id]?.channel;
  const guildData = await client.getGuildData(guild);
  const lang = languages[guildData.language];
  
  // Resume queue if paused
  if (queue.paused) client.distube.resume(queue);
  // Check whether to send a new dashboard message
  if (Date.now() - client.dashboards[guild.id]?.createdTimestamp < client.config.DASHBOARD_MESSAGE_MAX_LIFE * 1000) client.editDashboardMessage(guild, queue, lang);
  else if (channel) client.sendDashboardMessage(guild, channel, queue, lang);
}