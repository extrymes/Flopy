const { SlashCommandBuilder } = require("discord.js");
const languages = require("../utils/languages");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("volume")
		.setDescription(`${languages["en"].COMMAND_VOLUME_DESCRIPTION}`)
		.setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_VOLUME_DESCRIPTION}` })
		.setDMPermission(false)
		.addIntegerOption((option) =>
			option
				.setName("percentage")
				.setDescription(`${languages["en"].COMMAND_VOLUME_OPTION_PERCENTAGE}`)
				.setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_VOLUME_OPTION_PERCENTAGE}` })
				.setRequired(true)
		),
	run: async (client, interaction, guildData, queue, lang) => {
		const { guild, member, options } = interaction;
		const percentage = options.getInteger("percentage");

		if (!queue?.songs[0])
			return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_NO_PLAYING}`);
		if (!client.checkMemberIsInMyVoiceChannel(guild, member))
			return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
		if (percentage < 1 || percentage > 100)
			return client.sendErrorNotification(interaction, `${lang.ERROR_VOLUME_INVALID_PERCENTAGE}`);
		if (percentage === queue.volume)
			return client.sendErrorNotification(interaction, `${lang.ERROR_VOLUME_ALREADY_SET.replace("$percentage", `\`${percentage}%\``)}`);
		if (!client.handleCooldown("volumeCommand", guild.id, 2000))
			return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
		await interaction.deferReply().catch((error) => { });
		try {
			// Set volume percentage
			await client.distube.setVolume(queue, percentage);
			// Update dashboard message and send notification
			client.updateDashboardMessage(guild, queue, lang);
			client.sendNotification(interaction, `${lang.MESSAGE_VOLUME_SET.replace("$percentage", `\`${percentage}%\``)}`, { editReply: true });
		} catch (error) {
			const errorMessage = client.getErrorMessage(error.message, lang);
			client.sendErrorNotification(interaction, `${errorMessage}`, { editReply: true });
		}
	}
}
