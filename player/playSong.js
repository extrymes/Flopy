const languages = require("../utils/languages");

module.exports = async (client, queue, song) => {
  const guild = queue.textChannel.guild;
  const channel = client.dashboards.get(guild.id)?.channel;
  const settings = await client.getGuildData(guild);
  const lang = languages[settings.language];

  if (queue.paused) client.distube.resume(queue);
  if (Date.now() - client.dashboards.get(guild.id)?.createdTimestamp < client.config.DASHBOARD_MAX_LIFE * 1000) client.editDashboard(guild, queue, lang);
  else client.sendDashboard(guild, channel, queue, lang);
}