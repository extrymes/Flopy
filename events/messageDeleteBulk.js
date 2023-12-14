module.exports = async (client, messages) => {
  const guild = messages.first().guild;

  if (messages.get(client.dashboards[guild.id]?.id)) {
    delete client.dashboards[guild.id];
    client.leaveVoiceChannel(guild);
  }
}