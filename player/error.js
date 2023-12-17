const languages = require("../utils/languages");

module.exports = async (client, channel, error) => {
  const guild = channel.guild;
  const guildData = await client.getGuildData(guild);
  const lang = languages[guildData.language];

  // Send error notification
  const errorMessage = client.getErrorMessage(error.message, lang);
  client.sendErrorNotification(channel, `${errorMessage}`);
}