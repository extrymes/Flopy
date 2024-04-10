module.exports = async (client, message) => {
	const guild = message.guild;

	if (message !== client.dashboards[guild.id]) return;
	// Remove guild dashboard from hash and leave voice channel
	delete client.dashboards[guild.id];
	if (client.handleCooldown("leaveVoiceChannel", guild.id, 0)) client.leaveVoiceChannel(guild);
}
