const config = require("../admin/config");
const languages = require("../utils/languages");

module.exports = async (client) => {
  // Update presence in interval
  setInterval(() => client.user.setPresence({ activities: [{ name: `@${client.user.username}`, type: 2 }], status: "online" }), config.PRESENCE_UPDATE_INTERVAL * 1000);
  console.log(`[-] ${client.user.username} is online`.green);

  // Browse all guilds (search for new guilds, retrieve data, update dashboard messages, and join voice channels)
  console.log("[!] Browse all guilds...".yellow);
  client.guilds.cache.forEach(async (guild) => {
    const guildData = await client.getGuildData(guild);
    if (guildData.newGuild) return client.sendNewGuildMessage(guild);
    try {
      await client.getDashboardMessage(guild, guildData);
      const voiceChannel = guild.channels.cache.get(guildData.voice);
      const queue = client.distube.getQueue(guild);
      const lang = languages[guildData.language];
      client.updateDashboardMessage(guild, queue, lang);
      await client.distube.voices.join(voiceChannel);
    } catch (error) { }
  });
}