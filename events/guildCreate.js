const languages = require("../utils/languages");

module.exports = async (client, guild) => {
  const guildData = await client.getGuildData(guild);

  if (guildData.newGuild) return client.sendFirstMessage(guild);
  await client.getDashboardMessage(guild, guildData);
  if (!client.dashboards[guild.id]) return;
  const voiceChannel = guild.channels.cache.get(guildData.voice);
  const queue = client.distube.getQueue(guild);
  const lang = languages[guildData.language];
  client.editDashboardMessage(guild, queue, lang);
  try { client.distube.voices.join(voiceChannel).catch((error) => { }) } catch(error) { }
}