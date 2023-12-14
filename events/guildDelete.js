module.exports = async (client, guild) => {
  delete client.dashboards[guild.id];
}