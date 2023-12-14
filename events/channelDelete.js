module.exports = async (client, channel) => {
  const guild = channel.guild;

  if (channel === client.dashboards[guild.id]?.channel) {
    delete client.dashboards[guild.id];
    client.leaveVoiceChannel(guild);
  }
}