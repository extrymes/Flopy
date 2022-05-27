const Discord = require("discord.js")

module.exports.run = async (client, message, args, settings, queue, lang) => {
    const { channel, member, author } = message

    if(!queue) return client.sendError(channel, `${lang.ERROR_SONG_NO_PLAYING}`)
    if(client.cooldown("like" + author.id, 8000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
    const likeEmbed = new Discord.MessageEmbed().setTitle(`${client.element.EMOJI_LIKE}  ${lang.MESSAGE_SONG_LIKE.replace("$user", `**${member.displayName}**`)}`).setColor(client.element.COLOR_PINK)
    channel.send({ embeds: [likeEmbed] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 8000))
}
module.exports.help = {
    name: "like",
    description: "HELP_COMMAND_LIKE",
    usage: "",
}