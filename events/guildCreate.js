const languages = require("../utils/languages");

module.exports = async (client, guild) => {
	const guildData = await client.getGuildData(guild);

	// Check if guild is a new guild
	if (guildData.newGuild)
		return client.sendNewGuildMessage(guild);
	try {
		// Retrieve data, update dashboard message and join voice channel
		await client.getDashboardMessage(guild, guildData);
		const voiceChannel = guild.channels.cache.get(guildData.voice);
		const queue = client.distube.getQueue(guild);
		const lang = languages[guildData.language];
		client.updateDashboardMessage(guild, queue, lang);
		await client.distube.voices.join(voiceChannel);
	} catch (error) { }
}
