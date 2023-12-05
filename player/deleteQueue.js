const languages = require("../utils/languages");

module.exports = async (client, queue) => {
  const guild = queue.textChannel.guild;
  const settings = await client.getGuildData(guild);
  const lang = languages[settings.flopy1.language];

  client.editDashboard(guild, queue, lang);
}