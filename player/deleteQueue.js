const languages = require("../utils/languages");

module.exports = async (client, queue) => {
  const guild = queue.textChannel.guild;
  const guildData = await client.getGuildData(guild);
  const lang = languages[guildData.language];

  client.editDashboardMessage(guild, queue, lang);
}