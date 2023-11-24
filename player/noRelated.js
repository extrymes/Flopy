const languages = require("../utils/languages");

module.exports = async (client, queue) => {
  const guild = queue.textChannel.guild;
  const channel = client.dashboards.get(guild.id)?.channel;
  const settings = await client.getGuild(guild);
  const lang = languages[settings.flopy1.language];

  client.sendErrorNotification(channel, `${lang.ERROR_SONG_NO_RELATED_FOUND}`);
}