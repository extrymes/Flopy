module.exports = async (client, guild) => {
  // Remove guild dashboard from hash
  delete client.dashboards[guild.id];
}