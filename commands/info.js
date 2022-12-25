const { EmbedBuilder } = require("discord.js")
const elements = require("../util/elements")
const languages = require("../util/languages")

module.exports.run = async (client, interaction, settings, queue, lang) => {
    const member = interaction.member
    const song = queue?.songs[0]

    if(!song) return client.replyError(interaction, false, `${lang.ERROR_SONG_NO_PLAYING}`)
    if(!client.manageCooldown("info", member.id, 2000)) return client.replyError(interaction, false, `${lang.ERROR_ACTION_NOT_POSSIBLE}`)
    const bar = client.createBar(queue)
    const infoEmbed = new EmbedBuilder().setAuthor({ name: `${song.name}`, url: song.url, iconURL: elements.ICON_FLOPY }).setThumbnail(song.thumbnail || elements.BANNER_SECONDARY).addFields({ name: `**${lang.MESSAGE_SONG_AUTHOR}**`, value: `${song.uploader.name}`, inline: true }, { name: `**${lang.MESSAGE_SONG_VIEWS}**`, value: `${song.views.toString().replace(/(.)(?=(\d{3})+$)/g,"$1,")}`, inline: true }, { name: `**${lang.MESSAGE_SONG_LIKES}**`, value: `${song.likes.toString().replace(/(.)(?=(\d{3})+$)/g,"$1,")}`, inline: true }, { name: `**${lang.MESSAGE_SONG_DURATION}**`, value: `${bar}` }).setColor(elements.COLOR_FLOPY)
    interaction.reply({ embeds: [infoEmbed], ephemeral: true }).catch(error => {})
    setTimeout(() => interaction.deleteReply().catch(error => {}), 60000)
}
module.exports.data = {
    name: "info",
    description: languages["en"].COMMAND_INFO_DESCRIPTION,
    description_localizations: { "fr": languages["fr"].COMMAND_INFO_DESCRIPTION },
    dm_permission: false,
}