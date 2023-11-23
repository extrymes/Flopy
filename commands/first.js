const { SlashCommandBuilder } = require("discord.js");
const languages = require("../utils/languages");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("first")
        .setDescription(`${languages["en"].COMMAND_FIRST_DESCRIPTION}`)
        .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_FIRST_DESCRIPTION}` })
        .setDMPermission(false)
        .addStringOption((option) =>
            option
                .setName("query")
                .setDescription(`${languages["en"].COMMAND_FIRST_OPTION}`)
                .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_FIRST_OPTION}` })
                .setRequired(true)
        ),
    run: async (client, interaction, settings, queue, lang) => {
        const { guild, channel, member, options } = interaction;
        const query = options.getString("query");

        if (!member.voice.channel) return client.sendErrorNotification(interaction, `${lang.ERROR_USER_MUST_JOIN_VOICE}`);
        if (!client.checkVoice(guild, member) && queue) return client.sendErrorNotification(interaction, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`);
        if (!client.manageCooldown("play", member.id, 2000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
        await interaction.deferReply().catch((error) => { });
        client.distube.play(member.voice.channel, query, { textChannel: channel, member: member, metadata: interaction, position: 1 }).catch((error) => {
            const errorMessage = client.getErrorMessage(error.message, lang);
            client.sendErrorNotification(interaction, `${errorMessage}`, true);
        });
    }
}