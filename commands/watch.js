const Discord = require("discord.js")
const code = {}

module.exports.run = async (client, message, args, queue, settings, lang) => {
    const guild = message.guild
    const channel = message.channel
    const member = message.member

    if(!member.voice.channel) return client.sendError(channel, `${lang.ERROR_USER_NO_CHANNEL}`)
    if(!member.voice.channel.permissionsFor(guild.me).has("CREATE_INSTANT_INVITE")) return client.sendError(channel, `${lang.ERROR_UNABLE_TO_CREATE_INVITE}`)
    await client.fetchInvite(code[member.voice.channel.id]).catch(async error => {
        await client.activity.createTogetherCode(member.voice.channel.id, "youtube").then(invite => {
            code[member.voice.channel.id] = invite.code
        })
    })
    const gameEmbed = new Discord.MessageEmbed().setAuthor({ name: "Watch Together", iconURL: client.element.ICON_FLOPY }).setImage(client.element.BANNER_YOUTUBE).setColor(client.element.COLOR_FLOPY)
    const gameButtons = new Discord.MessageActionRow().addComponents(new Discord.MessageButton().setURL(code[member.voice.channel.id]).setStyle("LINK").setEmoji(client.element.EMOJI_PLAY))
    channel.send({ embeds: [gameEmbed], components: [gameButtons] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 8000))
}
module.exports.help = {
    name: "watch",
    type: "command",
    title: "lang.HELP_COMMAND",
    description: "lang.HELP_COMMAND_WATCH",
    usage: "",
}