const { SlashCommandBuilder } = require("discord.js");
const languages = require("../utils/languages");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shuffle")
        .setDescription(`${languages["en"].COMMAND_SHUFFLE_DESCRIPTION}`)
        .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_SHUFFLE_DESCRIPTION}` })
        .setDMPermission(false),
    run: async (client, interaction, settings, queue, lang) => {
        const { guild, member } = interaction;

        if (!queue?.songs[1]) return client.sendErrorNotification(interaction, `${lang.ERROR_QUEUE_NO_SONG}`);
        if (!client.checkVoice(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`);
        if (!client.manageCooldown("shuffle", guild.id, 2000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
        await client.distube.shuffle(queue);
        client.editDashboard(guild, queue, lang);
        client.sendNotification(interaction, `${lang.MESSAGE_QUEUE_SHUFFLED}`);
    }
}