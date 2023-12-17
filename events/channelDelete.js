module.exports = async (client, channel) => {
  const guild = channel.guild;

  if (channel !== client.dashboards[guild.id]?.channel) return;
  // Remove guild dashboard from hash and leave voice channel
  delete client.dashboards[guild.id];
  client.leaveVoiceChannel(guild);
}