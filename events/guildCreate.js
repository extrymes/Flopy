const languages = require("../utils/languages");

module.exports = async (client, guild) => {
  const guildData = await client.getGuildData(guild);

  if (guildData.newGuild) {
    client.sendFirstMessage(guild);
  } else {
    await client.getDashboard(guild, guildData);
    if (client.dashboards.has(guild.id)) {
      const voiceChannel = guild.channels.cache.get(guildData.voice);
      const queue = client.distube.getQueue(guild);
      const lang = languages[guildData.language];
      client.editDashboard(guild, queue, lang);
      try { client.distube.voices.join(voiceChannel).catch((error) => { }) } catch(error) { }
    }
  }
}