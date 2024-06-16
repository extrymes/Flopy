const config = require("../admin/config");
const languages = require("../utils/languages");

module.exports = async (client, queue, song) => {
	const guild = queue.textChannel.guild;
	const channel = queue.textChannel;
	const destination = song.metadata.interaction || channel;
	const guildData = await client.getGuildData(guild);
	const lang = languages[guildData.language];
	const playing = song.metadata.playing;

	// Resume queue if paused
	if (queue.paused) client.distube.resume(queue);
	// Update or send new dashboard message if its maximum lifetime is reached
	if (Date.now() - client.dashboards[guild.id]?.createdTimestamp < config.DASHBOARD_MESSAGE_MAX_LIFETIME * 1000) await client.updateDashboardMessage(guild, queue, lang);
	else {
		try {
			await client.sendDashboardMessage(guild, channel, queue, lang);
		} catch (error) {
			const errorMessage = client.getErrorMessage(error.message, lang);
			client.sendErrorNotification(destination, `${errorMessage}`);
			return client.leaveVoiceChannel(guild);
		}
	}
	// Send advanced notification if queue is not already playing before
	if (!playing && (!song.playlist || song == song.playlist.songs[0])) client.sendAdvancedNotification(destination, `${lang.MESSAGE_NOW_PLAYING}`, `${song.name}`, song.thumbnail, { editReply: true });
}
