const { SlashCommandBuilder } = require("discord.js");
const languages = require("../utils/languages");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("jump")
		.setDescription(`${languages["en"].COMMAND_JUMP_DESCRIPTION}`)
		.setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_JUMP_DESCRIPTION}` })
		.setDMPermission(false)
		.addIntegerOption((option) =>
			option
				.setName("position")
				.setDescription(`${languages["en"].COMMAND_JUMP_OPTION_POSITION}`)
				.setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_JUMP_OPTION_POSITION}` })
				.setRequired(true)
		),
	run: async (client, interaction, guildData, queue, lang) => {
		const { guild, member, options } = interaction;
		const position = options.getInteger("position");

		if (!queue?.songs[position] || position === 0)
			return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_INVALID_POSITION}`);
		if (!client.checkMemberIsInMyVoiceChannel(guild, member))
			return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
		if (!client.handleCooldown("jumpCommand", guild.id, 2000))
			return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
		await interaction.deferReply().catch((error) => { });
		try {
			// Jump to position
			const song = await client.distube.jump(queue, position);
			// Resume queue if paused
			if (queue.paused)
				client.distube.resume(queue);
			// Send advanced notification
			client.sendAdvancedNotification(interaction, `${lang.MESSAGE_SONG_SKIPPED.replace("$position", `#${position}`)}`, `${song.name}`, song.thumbnail, { editReply: true });
		} catch (error) {
			const errorMessage = client.getErrorMessage(error.message, lang);
			client.sendErrorNotification(interaction, `${errorMessage}`, { editReply: true });
		}
	}
}
