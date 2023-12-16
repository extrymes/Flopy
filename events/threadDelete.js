module.exports = async (client, thread) => {
  const guild = thread.guild;

  if (thread !== client.dashboards[guild.id]?.channel) return;
  delete client.dashboards[guild.id];
  client.leaveVoiceChannel(guild);
}