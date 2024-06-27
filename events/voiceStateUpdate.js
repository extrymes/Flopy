const config = require("../admin/config");
const emptyTimeouts = {};

module.exports = async (client, oldState, newState) => {
	const { guild, channel: newVoiceChannel, member } = newState;
	const oldVoiceChannel = oldState.channel;
	const guildData = await client.getGuildData(guild);
	const queue = client.distube.getQueue(guild);

	// Check if member is Flopy
	if (member === guild.members.me) {
		if (!newVoiceChannel) {
			// Force leave voice channel (Distube issue)
			client.distube.voices.leave(guild);
			// Re-join voice channel
			if (client.handleCooldown("joinVoiceChannel", guild.id, 5000)) {
				try {
					await client.distube.voices.join(oldVoiceChannel);
				} catch (error) { }
			}
		}
		if (client.handleCooldown("updateVoiceChannel", guild.id, config.VOICE_CHANNEL_UPDATE_COOLDOWN * 1000)) {
			setTimeout(async () => {
				// Leave voice channel if guild dashboard is not in hash
				if (!client.dashboards[guild.id])
					return client.leaveVoiceChannel(guild);
				// Update voice channel in database
				const voiceId = member.voice.channel?.id || null;
				if (voiceId !== guildData.voice) {
					try {
						await client.updateGuildData(guild, { voice: voiceId });
					} catch (error) { }
				}
			}, config.VOICE_CHANNEL_UPDATE_COOLDOWN * 1000);
		}
	}
	if (queue) {
		// Leave voice channel after timeout when it is empty
		const currentTimeout = emptyTimeouts[guild.id];
		const isEmpty = client.checkMyVoiceChannelIsEmpty(guild);
		if (!currentTimeout && isEmpty) {
			emptyTimeouts[guild.id] = setTimeout(async () => {
				delete emptyTimeouts[guild.id];
				try {
					await client.distube.stop(queue);
				} catch (error) { }
			}, config.VOICE_CHANNEL_EMPTY_TIMEOUT * 1000);
		} else if (currentTimeout && !isEmpty) {
			clearTimeout(currentTimeout);
			delete emptyTimeouts[guild.id];
		}
	}
}
