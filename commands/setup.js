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
        .setDescription(`${languages["en"].COMMAND_SETUP_OPTION}`)
        .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_SETUP_OPTION}` })
        .setRequired(true)
        .setChoices({ name: `${elements.EMOJI_LANG_EN} English`, value: "en" }, { name: `${elements.EMOJI_LANG_FR} Français`, value: "fr" })
    ),
  run: async (client, interaction, guildData, queue, lang) => {
    const { guild, channel, member, options } = interaction;
    const language = options.getString("language");

    if (!client.checkMemberIsManager(member)) return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_BE_MANAGER}`);
    if (!client.checkMessageIsSendable(guild, channel)) return client.sendErrorNotification(interaction, `${lang.ERROR_DASHBOARD_UNABLE_SETUP}`);
    if (!client.manageCooldown("setupCommand", guild.id, 4000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
    await interaction.deferReply().catch((error) => { });
    if (language !== guildData.language) await client.updateGuildData(guild, { language: language });
    client.sendDashboardMessage(guild, channel, queue, languages[language]);
    interaction.deleteReply().catch((error) => { });
  }
}