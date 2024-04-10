const languages = require("../utils/languages");

module.exports = async (client, message) => {
	const { guild, channel, member } = message;
	const guildData = await client.getGuildData(guild);
	const queue = client.distube.getQueue(guild);
	const lang = languages[guildData.language];

	if (message.author.bot) return;
	if (channel !== client.dashboards[guild.id]?.channel) {
		// Send help message if Flopy is mentioned
		if (message.mentions.users.first() === client.user && client.handleCooldown("sendHelpMessage", member.id, 4000)) client.sendHelpMessage(guild, channel, lang);
		return;
	}
	// Delete message
	message.delete().catch((error) => { });
	if (!member.voice.channel) return client.sendErrorNotification(channel, `${lang.ERROR_MEMBER_MUST_JOIN_VOICE_CHANNEL}`);
	if (!client.checkMemberIsInMyVoiceChannel(guild, member) && queue) return	client.sendErrorNotification(channel, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
	if (!client.handleCooldown("playQuery", member.id, 2000)) return client.sendErrorNotification(channel, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
	await channel.sendTyping().catch((error) => { });
	try {
		// Play or add item to the queue using message content
		await client.distube.play(member.voice.channel, message.content, { textChannel: channel, member: member });
	} catch (error) {
		const errorMessage = client.getErrorMessage(error.message, lang);
		client.sendErrorNotification(channel, `${errorMessage}`);
	}
}
