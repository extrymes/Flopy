const languages = require("../utils/languages");

module.exports = async (client, channel, error) => {
  const guild = channel.guild;
  const settings = await client.getGuildData(guild);
  const lang = languages[settings.language];

  const errorMessage = client.getErrorMessage(error.message, lang);
  client.sendErrorNotification(channel, `${errorMessage}`);
}