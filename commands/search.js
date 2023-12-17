const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const config = require("../admin/config");
const elements = require("../utils/elements");
const languages = require("../utils/languages");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription(`${languages["en"].COMMAND_SEARCH_DESCRIPTION}`)
    .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_SEARCH_DESCRIPTION}` })
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription(`${languages["en"].COMMAND_SEARCH_OPTION}`)
        .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_SEARCH_OPTION}` })
        .setRequired(true)
    ),
  run: async (client, interaction, guildData, queue, lang) => {
    const { member, options } = interaction;
    const query = options.getString("query");

    if (!client.manageCooldown("searchCommand", member.id, 4000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
    // Search query and send results
    await interaction.deferReply({ ephemeral: true }).catch((error) => { });
    const songs = await client.distube.search(query).catch((error) => {
      const errorMessage = client.getErrorMessage(error.message, lang);
      client.sendErrorNotification(interaction, `${errorMessage}`, { editReply: true });
    });
    if (!songs) return;
    const formattedSongs = songs.map((song, i) => { return { label: `${i + 1}. ${song.name.length > config.SONG_NAME_MAX_LENGTH_DISPLAY ? song.name.substr(0, config.SONG_NAME_MAX_LENGTH_DISPLAY).concat("...") : song.name}`, value: song.url } });
    const searchEmbed = new EmbedBuilder().setAuthor({ name: `${songs[0].name}`, url: songs[0].url, iconURL: elements.ICON_FLOPY }).setThumbnail(songs[0].thumbnail).addFields({ name: `**${lang.MESSAGE_SONG_AUTHOR}**`, value: `${songs[0].uploader.name}`, inline: true }, { name: `**${lang.MESSAGE_SONG_VIEWS}**`, value: `${songs[0].views.toString().replace(/(.)(?=(\d{3})+$)/g, "$1,")}`, inline: true }).setColor(elements.COLOR_FLOPY);
    const searchMenu = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("play").setOptions(formattedSongs));
    interaction.editReply({ embeds: [searchEmbed], components: [searchMenu], ephemeral: true }).catch((error) => { });
    setTimeout(() => interaction.deleteReply().catch((error) => { }), 60000);
  }
}