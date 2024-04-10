const { SlashCommandBuilder } = require("discord.js");
const languages = require("../utils/languages");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("filter")
		.setDescription(`${languages["en"].COMMAND_FILTER_DESCRIPTION}`)
		.setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_FILTER_DESCRIPTION}` })
		.setDMPermission(false)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("toggle")
				.setDescription(`${languages["en"].COMMAND_FILTER_TOGGLE_DESCRIPTION}`)
				.setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_FILTER_TOGGLE_DESCRIPTION}` })
				.addStringOption((option) =>
					option
						.setName("name")
						.setDescription(`${languages["en"].COMMAND_FILTER_TOGGLE_OPTION_NAME}`)
						.setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_FILTER_TOGGLE_OPTION_NAME}` })
						.setChoices({ name: "3d", value: "3d" }, { name: "8d", value: "8d" }, { name: "bassboost", value: "bassboost" }, { name: "subboost", value: "subboost" }, { name: "purebass", value: "purebass" }, { name: "nightcore", value: "nightcore" }, { name: "vaporwave", value: "vaporwave" }, { name: "phaser", value: "phaser" }, { name: "tremolo", value: "tremolo" }, { name: "vibrato", value: "vibrato" }, { name: "pulsator", value: "pulsator" }, { name: "earwax", value: "earwax" }, { name: "echo", value: "echo" }, { name: "fast", value: "fast" }, { name: "flanger", value: "flanger" }, { name: "gate", value: "gate" }, { name: "haas", value: "haas" }, { name: "mcompand", value: "mcompand" })
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("reset")
				.setDescription(`${languages["en"].COMMAND_FILTER_RESET_DESCRIPTION}`)
				.setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_FILTER_RESET_DESCRIPTION}` })
		),
	run: async (client, interaction, guildData, queue, lang) => {
		const { guild, member, options } = interaction;
		const subcommand = options.getSubcommand();
		const filters = queue?.filters;

		switch (subcommand) {
			case "toggle":
				const name = options.getString("name");
				if (!queue?.songs[0]) return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_NO_PLAYING}`);
				if (!client.checkMemberIsInMyVoiceChannel(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
				if (!client.handleCooldown("filterCommand", guild.id, 2000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
				await interaction.deferReply().catch((error) => { });
				try {
					// Toggle filter
					if (filters.has(name)) await filters.remove(name);
						else await filters.add(name);
					// Resume queue if paused
					if (queue.paused) client.distube.resume(queue);
					// Update dashboard message and send notification
					const filterNames = filters.names.map((filterName, i) => { return `\`${filterName}\`` }).join(", ");
					client.updateDashboardMessage(guild, queue, lang);
					client.sendNotification(interaction, `${lang.MESSAGE_FILTERS_ACTIVE} ${filterNames || lang.MESSAGE_FILTERS_NONE}`, { editReply: true });
				} catch (error) {
					const errorMessage = client.getErrorMessage(error.message, lang);
					client.sendErrorNotification(interaction, `${errorMessage}`, { editReply: true });
				}
				break;
			case "reset":
				if (!filters?.size) return client.sendErrorNotification(interaction, `${lang.ERROR_FILTER_NO_ACTIVE}`);
				if (!client.checkMemberIsInMyVoiceChannel(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
				if (!client.handleCooldown("filterCommand", guild.id, 2000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
				await interaction.deferReply().catch((error) => { });
				try {
					// Clear filters
					await filters.clear();
					// Resume queue if paused
					if (queue.paused) client.distube.resume(queue);
					// Update dashboard message and send notification
					client.updateDashboardMessage(guild, queue, lang);
					client.sendNotification(interaction, `${lang.MESSAGE_FILTERS_ACTIVE} ${lang.MESSAGE_FILTERS_NONE}`, { editReply: true });
				} catch (error) {
					const errorMessage = client.getErrorMessage(error.message, lang);
					client.sendErrorNotification(interaction, `${errorMessage}`, { editReply: true });
				}
				break;
		}
	}
}
