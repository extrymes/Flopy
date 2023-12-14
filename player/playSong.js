const languages = require("../utils/languages");

module.exports = async (client, queue, song) => {
  const guild = queue.textChannel.guild;
  const channel = client.dashboards[guild.id]?.channel;
  const guildData = await client.getGuildData(guild);
  const lang = languages[guildData.language];

  if (queue.paused) client.distube.resume(queue);
  if (Date.now() - client.dashboards[guild.id]?.createdTimestamp < client.config.DASHBOARD_MAX_LIFE * 1000) client.editDashboardMessage(guild, queue, lang);
  else client.sendDashboardMessage(guild, channel, queue, lang);
}