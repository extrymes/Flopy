const languages = require("../utils/languages");

module.exports = async (client, queue, error) => {
	const guild = queue.textChannel.guild;
	const channel = queue.textChannel;
	const guildData = await client.getGuildData(guild);
	const lang = languages[guildData.language];

	// Send error notification
	client.sendErrorNotification(channel, `${lang.ERROR_SONG_NO_RELATED_FOUND}`);
}
