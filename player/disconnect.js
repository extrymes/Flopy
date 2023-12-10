const languages = require("../utils/languages");

module.exports = async (client, queue) => {
  const guild = queue.textChannel.guild;
  const channel = client.dashboards.get(guild.id)?.channel;
  const guildData = await client.getGuildData(guild);
  const lang = languages[guildData.language];

  client.sendErrorNotification(channel, `${lang.ERROR_VOICE_CHANNEL_DISCONNECTED}`);
}