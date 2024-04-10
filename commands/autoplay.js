const { SlashCommandBuilder } = require("discord.js");
const languages = require("../utils/languages");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("autoplay")
		.setDescription(`${languages["en"].COMMAND_AUTOPLAY_DESCRIPTION}`)
		.setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_AUTOPLAY_DESCRIPTION}` })
		.setDMPermission(false),
	run: async (client, interaction, guildData, queue, lang) => {
		const { guild, member } = interaction;

		if (!queue?.songs[0]) return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_NO_PLAYING}`);
		if (!client.checkMemberIsInMyVoiceChannel(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
		if (!client.handleCooldown("autoplayCommand", guild.id, 2000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
		await interaction.deferReply().catch((error) => { });
		try {
			// Toggle autoplay
			const autoplay = await client.distube.toggleAutoplay(queue);
			// Update dashboard message and send notification
			client.updateDashboardMessage(guild, queue, lang);
			client.sendNotification(interaction, `${autoplay ? lang.MESSAGE_AUTOPLAY_ENABLED : lang.MESSAGE_AUTOPLAY_DISABLED}`, { editReply: true });
		} catch (error) {
			const errorMessage = client.getErrorMessage(error.message, lang);
			client.sendErrorNotification(interaction, `${errorMessage}`, { editReply: true });
		}
	}
}
