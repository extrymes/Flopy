module.exports = async (client, messages) => {
  const guild = messages.first().guild;

  if (messages.get(client.dashboards.get(guild.id)?.id)) {
    client.dashboards.delete(guild.id);
    client.leaveVoice(guild);
  }
}