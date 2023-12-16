const languages = require("../utils/languages");

module.exports = (client) => {
  // Status
  console.log(`[-] ${client.user.username} is online`.green);
  setInterval(() => client.user.setPresence({ activities: [{ name: `@${client.user.username}`, type: 2 }], status: "online" }), client.config.PRESENCE_UPDATE_INTERVAL * 1000);

  // Guilds
  console.log("[!] Checking guilds ...".yellow);
  client.guilds.cache.forEach(async (guild) => {
    const guildData = await client.getGuildData(guild);
    if (guildData.newGuild) return client.sendFirstMessage(guild);
    await client.getDashboardMessage(guild, guildData);
    if (!client.dashboards[guild.id]) return;
    const voiceChannel = guild.channels.cache.get(guildData.voice);
    const queue = client.distube.getQueue(guild);
    const lang = languages[guildData.language];
    client.editDashboardMessage(guild, queue, lang);
    try { client.distube.voices.join(voiceChannel).catch((error) => { }) } catch (error) { }
  });
}