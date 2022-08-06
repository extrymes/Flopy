const { EmbedBuilder } = require("discord.js")
const elements = require("../util/elements")
const languages = require("../util/languages")

module.exports.run = async (client, interaction, settings, queue, lang) => {
    const member = interaction.member

    if(!queue?.songs[0]) return client.replyError(interaction, false, `${lang.ERROR_SONG_NO_PLAYING}`)
    if(client.cooldown("like" + member.id, 8000)) return client.replyError(interaction, false, `${lang.ERROR_ACTION_TOO_FAST}`)
    const likeEmbed = new EmbedBuilder().setTitle(`${elements.EMOJI_LIKE}  ${lang.MESSAGE_SONG_LIKE.replace("$user", `**${member.displayName}**`)}`).setColor(elements.COLOR_PINK)
    interaction.reply({ embeds: [likeEmbed] })
    setTimeout(() => interaction.deleteReply().catch(error => {}), 8000)
}
module.exports.data = {
    name: "like",
    description: languages["en"].COMMAND_LIKE_DESCRIPTION,
    description_localizations: { "fr": languages["fr"].COMMAND_LIKE_DESCRIPTION },
    dm_permission: false,
}