module.exports = async (client, message) => {
  const guild = message.guild;

  if (message !== client.dashboards[guild.id]) return;
  delete client.dashboards[guild.id];
  if (client.manageCooldown("leaveVoiceChannel", guild.id, 0)) client.leaveVoiceChannel(guild);
}