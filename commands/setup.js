const { SlashCommandBuilder } = require("discord.js");
const elements = require("../utils/elements");
const languages = require("../utils/languages");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription(`${languages["en"].COMMAND_SETUP_DESCRIPTION}`)
        .setDescriptionLocalizations({ "fr": `${languages["en"].COMMAND_SETUP_DESCRIPTION}` })
        .setDMPermission(false)
        .addStringOption((option) =>
            option
                .setName("language")
                .setDescription(`${languages["en"].COMMAND_SETUP_OPTION}`)
                .setDescriptionLocalizations({ "fr": `${languages["en"].COMMAND_SETUP_OPTION}` })
                .setRequired(true)
                .setChoices({ name: `${elements.EMOJI_LANG_EN} English`, value: "en" }, { name: `${elements.EMOJI_LANG_FR} Français`, value: "fr" })
        ),
    run: async (client, interaction, settings, queue, lang) => {
        const { guild, channel, member, options } = interaction;
        const language = options.getString("language");

        if (!client.checkManager(member)) return client.sendErrorNotification(interaction, `${lang.ERROR_USER_MUST_BE_MANAGER}`);
        if (!client.checkSendable(channel, guild.members.me)) return client.sendErrorNotification(interaction, `${lang.ERROR_DASHBOARD_UNABLE_SETUP}`);
        if (!client.manageCooldown("setup", guild.id, 4000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
        await interaction.deferReply().catch((error) => { });
        if (language !== settings.flopy1.language) client.updateGuild(guild, { flopy1: Object.assign(settings.flopy1, { language: language }) });
        client.sendDashboard(guild, channel, settings, queue, languages[language]);
        interaction.deleteReply().catch((error) => { });
    }
}