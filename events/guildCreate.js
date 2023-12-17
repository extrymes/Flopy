const languages = require("../utils/languages");

module.exports = async (client, guild) => {
  const guildData = await client.getGuildData(guild);

  // Check if guild is a new guild
  if (guildData.newGuild) return client.sendNewGuildMessage(guild);
  // Retrieve data, update dashboard message and join voice channel
  await client.getDashboardMessage(guild, guildData);
  if (!client.dashboards[guild.id]) return;
  const voiceChannel = guild.channels.cache.get(guildData.voice);
  const queue = client.distube.getQueue(guild);
  const lang = languages[guildData.language];
  client.editDashboardMessage(guild, queue, lang);
  try { client.distube.voices.join(voiceChannel).catch((error) => { }) } catch(error) { }
}