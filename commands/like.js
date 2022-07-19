const { EmbedBuilder } = require("discord.js")

module.exports.run = async (client, message, args, settings, queue, lang) => {
    const { channel, member } = message

    if(!queue) return client.sendError(channel, `${lang.ERROR_SONG_NO_PLAYING}`)
    if(client.cooldown("like" + member.id, 8000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
    const likeEmbed = new EmbedBuilder().setTitle(`${client.elements.EMOJI_LIKE}  ${lang.MESSAGE_SONG_LIKE.replace("$user", `**${member.displayName}**`)}`).setColor(client.elements.COLOR_PINK)
    channel.send({ embeds: [likeEmbed] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 8000))
}
module.exports.data = {
    name: "like",
    description: "HELP_COMMAND_LIKE",
    usage: "",
}