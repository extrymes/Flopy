const { EmbedBuilder } = require("discord.js")

module.exports.run = async (client, interaction, settings, queue, lang) => {
    const guild = interaction.guild
    const song = queue?.songs[0]

    if(!song) return client.replyError(interaction, false, `${lang.ERROR_SONG_NO_PLAYING}`)
    if(client.cooldown("info" + guild.id, 8000)) return client.replyError(interaction, false, `${lang.ERROR_ACTION_TOO_FAST}`)
    const bar = await client.createBar(queue)
    const infoEmbed = new EmbedBuilder().setAuthor({ name: `${song.name}`, url: song.url, iconURL: client.elements.ICON_FLOPY }).setThumbnail(song.thumbnail || client.elements.BANNER_SECONDARY).addFields({ name: `**${lang.MESSAGE_SONG_AUTHOR}**`, value: `${song.uploader.name}`, inline: true }, { name: `**${lang.MESSAGE_SONG_VIEWS}**`, value: `${song.views.toString().replace(/(.)(?=(\d{3})+$)/g,"$1,")}`, inline: true }, { name: `**${lang.MESSAGE_SONG_LIKES}**`, value: `${song.likes.toString().replace(/(.)(?=(\d{3})+$)/g,"$1,")}`, inline: true }, { name: `**${lang.MESSAGE_SONG_DURATION}**`, value: `${bar}` }).setColor(client.elements.COLOR_FLOPY)
    interaction.reply({ embeds: [infoEmbed] })
    setTimeout(() => interaction.deleteReply().catch(error => {}), 8000)
}
module.exports.data = {
    name: "info",
    description: languages["en"].COMMAND_INFO_DESCRIPTION,
    description_localizations: { "fr": languages["fr"].COMMAND_INFO_DESCRIPTION },
    dm_permission: false,
}