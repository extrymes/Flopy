const languages = require("../utils/languages");

module.exports = async (client, message, query) => {
  const { guild, channel } = message;
  const settings = await client.getGuild(guild);
  const lang = languages[settings.flopy1.language];

  client.sendErrorNotification(channel, `${lang.ERROR_RESULT_NO_FOUND}`);
}