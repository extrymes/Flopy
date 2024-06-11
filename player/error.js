const languages = require("../utils/languages");

module.exports = async (client, error, queue, song) => {
	const guild = queue.textChannel.guild;
	const channel = queue.textChannel;
	const guildData = await client.getGuildData(guild);
	const lang = languages[guildData.language];

	// Send error notification
	const errorMessage = client.getErrorMessage(error.message, lang);
	client.sendErrorNotification(channel, `${errorMessage}`);
}
