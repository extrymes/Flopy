const languages = require("../utils/languages");

module.exports = async (client, interaction) => {
	const { guild, channel, member } = interaction;
	const guildData = await client.getGuildData(guild);
	const queue = client.distube.getQueue(guild);
	const lang = languages[guildData.language];

	if (interaction.isCommand()) {
		// Check if command is executed in dashboard channel
		if (channel !== client.dashboards[guild.id]?.channel && interaction.commandName !== "setup")
			return client.sendErrorNotification(interaction, `${lang.ERROR_COMMAND_NOT_USABLE}`);
		// Run command
		const command = require(`../commands/${interaction.commandName}`);
		return command.run(client, interaction, guildData, queue, lang);
	}
	switch (interaction.customId) {
		case "resume":
			if (!client.checkMemberIsInMyVoiceChannel(guild, member))
				return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
			try {
				// Resume queue and update dashboard message
				await client.distube.resume(queue);
				client.updateDashboardMessage(guild, queue, lang);
			} catch (error) { }
			interaction.deferUpdate().catch((error) => { });
			break;
		case "pause":
			if (!client.checkMemberIsInMyVoiceChannel(guild, member))
				return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
			try {
				// Pause queue and update dashboard message
				await client.distube.pause(queue);
				client.updateDashboardMessage(guild, queue, lang);
			} catch (error) { }
			interaction.deferUpdate().catch((error) => { });
			break;
		case "stop":
			if (!client.checkMemberIsInMyVoiceChannel(guild, member))
				return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
			try {
				// Stop queue
				await client.distube.stop(queue);
			} catch (error) { }
			interaction.deferUpdate().catch((error) => { });
			break;
		case "skip":
			if (!client.checkMemberIsInMyVoiceChannel(guild, member))
				return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
			try {
				// Skip to next song and resume queue if paused
				await client.distube.skip(queue);
				if (queue.paused)
					client.distube.resume(queue);
			} catch (error) { }
			interaction.deferUpdate().catch((error) => { });
			break;
		case "repeat":
			if (!client.checkMemberIsInMyVoiceChannel(guild, member))
				return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
			try {
				// Switch repeat mode and update dashboard message
				await client.distube.setRepeatMode(queue, queue.repeatMode === 0 ? 1 : queue.repeatMode === 1 ? 2 : 0);
				client.updateDashboardMessage(guild, queue, lang);
			} catch (error) { }
			interaction.deferUpdate().catch((error) => { });
			break;
		case "volume":
			if (!client.checkMemberIsInMyVoiceChannel(guild, member))
				return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
			try {
				// Switch volume and update dashboard message
				await client.distube.setVolume(queue, queue.volume === 50 ? 25 : queue.volume === 25 ? 75 : queue.volume === 75 ? 100 : 50);
				client.updateDashboardMessage(guild, queue, lang);
			} catch (error) { }
			interaction.deferUpdate().catch((error) => { });
			break;
	}
}
