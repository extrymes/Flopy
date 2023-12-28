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

    if (!client.handleCooldown("searchCommand", member.id, 4000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
    await interaction.deferReply({ ephemeral: true }).catch((error) => { });
    try {
      // Search for songs using query
      const songs = await client.distube.search(query);
      // Create search embed and menu
      const firstSong = songs[0];
      const formattedSongs = songs.map((song, i) => { return { label: `${i + 1}. ${song.name.length > config.SONG_NAME_MAX_LENGTH_DISPLAY ? song.name.substr(0, config.SONG_NAME_MAX_LENGTH_DISPLAY).concat("...") : song.name}`, value: song.url } });
      const searchEmbed = new EmbedBuilder().setAuthor({ name: `${firstSong.name}`, url: firstSong.url, iconURL: elements.ICON_FLOPY }).setThumbnail(firstSong.thumbnail).addFields({ name: `**${lang.MESSAGE_SONG_AUTHOR}**`, value: `${firstSong.uploader.name}`, inline: true }, { name: `**${lang.MESSAGE_SONG_VIEWS}**`, value: `${firstSong.views.toString().replace(/(.)(?=(\d{3})+$)/g, "$1,")}`, inline: true }).setColor(elements.COLOR_FLOPY);
      const searchMenu = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("play").setOptions(formattedSongs));
      // Send search results and then delete reply
      interaction.editReply({ embeds: [searchEmbed], components: [searchMenu] }).catch((error) => { });
      setTimeout(() => interaction.deleteReply().catch((error) => { }), 60000);
    } catch (error) {
      const errorMessage = client.getErrorMessage(error.message, lang);
      client.sendErrorNotification(interaction, `${errorMessage}`, { editReply: true });
    }
  }
}