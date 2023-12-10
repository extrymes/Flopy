const languages = require("../utils/languages");

module.exports = async (client, guild) => {
  const settings = await client.getGuildData(guild);

  if (settings.newGuild) {
    client.sendFirstMessage(guild);
  } else {
    await client.getDashboard(guild, settings);
    if (client.dashboards.has(guild.id)) {
      const voiceChannel = guild.channels.cache.get(settings.voice);
      const queue = client.distube.getQueue(guild);
      const lang = languages[settings.language];
      client.editDashboard(guild, queue, lang);
      try { client.distube.voices.join(voiceChannel).catch((error) => { }) } catch(error) { }
    }
  }
}