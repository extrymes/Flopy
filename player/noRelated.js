const languages = require("../utils/languages");

module.exports = async (client, queue) => {
  const guild = queue.textChannel.guild;
  const channel = client.dashboards[guild.id]?.channel;
  const guildData = await client.getGuildData(guild);
  const lang = languages[guildData.language];

  if (channel) client.sendErrorNotification(channel, `${lang.ERROR_SONG_NO_RELATED_FOUND}`);
}