const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const elements = require("../utils/elements");
const languages = require("../utils/languages");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription(`${languages["en"].COMMAND_INFO_DESCRIPTION}`)
    .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_INFO_DESCRIPTION}` })
    .setDMPermission(false),
  run: async (client, interaction, guildData, queue, lang) => {
    const member = interaction.member;
    const currentSong = queue?.songs[0];

    if (!currentSong) return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_NO_PLAYING}`);
    if (!client.handleCooldown("infoCommand", member.id, 2000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
    // Create duration bar
    const durationBar = client.createDurationBar(queue);
    // Create info embed
    const infoEmbed = new EmbedBuilder().setAuthor({ name: `${currentSong.name}`, url: currentSong.url, iconURL: elements.ICON_FLOPY }).setThumbnail(currentSong.thumbnail).addFields({ name: `**${lang.MESSAGE_SONG_AUTHOR}**`, value: `${currentSong.uploader?.name || "-"}`, inline: true }, { name: `**${lang.MESSAGE_SONG_VIEWS}**`, value: `${currentSong.views.toString().replace(/(.)(?=(\d{3})+$)/g, "$1,")}`, inline: true }, { name: `**${lang.MESSAGE_SONG_LIKES}**`, value: `${currentSong.likes.toString().replace(/(.)(?=(\d{3})+$)/g, "$1,")}`, inline: true }, { name: `**${lang.MESSAGE_SONG_DURATION}**`, value: `${durationBar}` }).setColor(elements.COLOR_FLOPY);
    // Send song informaton and then delete reply
    interaction.reply({ embeds: [infoEmbed], ephemeral: true }).catch(error => { });
    setTimeout(() => interaction.deleteReply().catch((error) => { }), 60000);
  }
}