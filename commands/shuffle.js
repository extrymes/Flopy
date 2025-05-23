const { SlashCommandBuilder } = require("discord.js");
const languages = require("../utils/languages");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("shuffle")
		.setDescription(`${languages["en"].COMMAND_SHUFFLE_DESCRIPTION}`)
		.setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_SHUFFLE_DESCRIPTION}` })
		.setDMPermission(false),
	run: async (client, interaction, guildData, queue, lang) => {
		const { guild, member } = interaction;

		if (!queue?.songs[1])
			return client.sendErrorNotification(interaction, `${lang.ERROR_QUEUE_NO_SONG}`);
		if (!client.checkMemberIsInMyVoiceChannel(guild, member))
			return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
		if (!client.handleCooldown("shuffleCommand", guild.id, 2000))
			return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
		await interaction.deferReply().catch((error) => { });
		try {
			// Shuffle queue
			await client.distube.shuffle(queue);
			// Update dashboard message and send notification
			client.updateDashboardMessage(guild, queue, lang);
			client.sendNotification(interaction, `${lang.MESSAGE_QUEUE_SHUFFLED}`, { editReply: true });
		} catch (error) {
			const errorMessage = client.getErrorMessage(error.message, lang);
			client.sendErrorNotification(interaction, `${errorMessage}`, { editReply: true });
		}
	}
}
