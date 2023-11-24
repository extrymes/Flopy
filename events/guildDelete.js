module.exports = async (client, guild) => {
  client.dashboards.delete(guild.id);
}