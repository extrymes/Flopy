const Discord = require("discord.js")
const code = {}

module.exports.run = async (client, message, args, settings, lang, queue) => {
    const guild = message.guild
    const channel = message.channel
    const member = message.member

    if(!member.voice.channel) return client.sendError(channel, `${lang.ERROR_USER_NO_VOICE}`)
    if(!member.voice.channel.permissionsFor(guild.me).has("CREATE_INSTANT_INVITE")) return client.sendError(channel, `${lang.ERROR_UNABLE_TO_CREATE_INVITE}`)
    if(client.cooldown(guild.id + "watch", 8000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
    await client.fetchInvite(code[member.voice.channel.id]).catch(async error => {
        await client.activity.createTogetherCode(member.voice.channel.id, "youtube").then(invite => code[member.voice.channel.id] = invite.code)
    })
    const watchEmbed = new Discord.MessageEmbed().setAuthor({ name: "Watch Together", iconURL: client.element.ICON_FLOPY }).setImage(client.element.BANNER_YOUTUBE).setColor(client.element.COLOR_FLOPY)
    const watchButton = new Discord.MessageActionRow().addComponents({ type: "BUTTON", url: code[member.voice.channel.id], style: "LINK", emoji: { id: client.element.EMOJI_PLAY } })
    channel.send({ embeds: [watchEmbed], components: [watchButton] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 8000))
}
module.exports.help = {
    name: "watch",
    type: "command",
    description: "HELP_COMMAND_WATCH",
    usage: "",
}