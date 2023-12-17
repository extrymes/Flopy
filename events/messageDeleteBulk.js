module.exports = async (client, messages) => {
  const guild = messages.first().guild;

  if (!messages.get(client.dashboards[guild.id]?.id)) return;
  // Remove guild dashboard from hash and leave voice channel
  delete client.dashboards[guild.id];
  client.leaveVoiceChannel(guild);
}