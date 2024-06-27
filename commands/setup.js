const { SlashCommandBuilder } = require("discord.js");
const elements = require("../utils/elements");
const languages = require("../utils/languages");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("setup")
		.setDescription(`${languages["en"].COMMAND_SETUP_DESCRIPTION}`)
		.setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_SETUP_DESCRIPTION}` })
		.setDMPermission(false)
		.addStringOption((option) =>
			option
				.setName("language")
				.setDescription(`${languages["en"].COMMAND_SETUP_OPTION_LANGUAGE}`)
				.setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_SETUP_OPTION_LANGUAGE}` })
				.setChoices({ name: `${elements.EMOJI_LANG_EN} English`, value: "en" }, { name: `${elements.EMOJI_LANG_FR} Français`, value: "fr" })
				.setRequired(true)
		),
	run: async (client, interaction, guildData, queue, lang) => {
		const { guild, channel, member, options } = interaction;
		const language = options.getString("language");
		const selectedLang = languages[language];

		if (!client.checkMemberIsManager(member))
			return client.sendErrorNotification(interaction, `${selectedLang.ERROR_MEMBER_MUST_BE_MANAGER}`);
		if (!client.checkMessageIsSendable(guild, channel))
			return client.sendErrorNotification(interaction, `${selectedLang.ERROR_DASHBOARD_UNABLE_SETUP}`);
		if (!client.handleCooldown("setupCommand", guild.id, 4000))
			return client.sendErrorNotification(interaction, `${selectedLang.ERROR_ACTION_NOT_POSSIBLE}`);
		await interaction.deferReply({ ephemeral: true }).catch((error) => { });
		try {
			// Update language in database
			if (language !== guildData.language)
				await client.updateGuildData(guild, { language: language });
			// Send new dashboard message and then delete reply
			await client.sendDashboardMessage(guild, channel, queue, selectedLang);
			client.sendNotification(interaction, `${selectedLang.MESSAGE_DASHBOARD_INSTALLED}`, { editReply: true });
		} catch (error) {
			const errorMessage = client.getErrorMessage(error.message, selectedLang);
			client.sendErrorNotification(interaction, `${errorMessage}`, { editReply: true });
			client.leaveVoiceChannel(guild);
		}
	}
}
