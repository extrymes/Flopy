const languages = require("../utils/languages");

module.exports = async (client, message, query) => {
  const { guild, channel } = message;
  const guildData = await client.getGuildData(guild);
  const lang = languages[guildData.language];

  client.sendErrorNotification(channel, `${lang.ERROR_RESULT_NO_FOUND}`);
}