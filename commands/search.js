const Discord = require("discord.js")

module.exports.run = async (client, message, args, settings, lang, queue) => {
    const guild = message.guild
    const channel = message.channel
    const member = message.member
    const query = args.slice(0).join(" ")

    if(!member.voice.channel) return client.sendError(channel, `${lang.ERROR_USER_NO_VOICE}`)
    if(!client.checkVoice(guild, member) && queue) return client.sendError(channel, `${lang.ERROR_USER_NO_CORRECT_VOICE}`)
    if(!query) return client.help(lang, channel, client.commands.get("search"))
    if(client.cooldown(guild.id + "search", 10000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
    channel.sendTyping().catch(error => {})
    const songs = await client.distube.search(query).catch(error => client.distube.emit("error", channel, error))
    if(!songs[0]) return
    const results = songs.map((item, i) => { return { label: `${i + 1}. ${item.name.length <= client.config.SONG_MAX_LENGTH ? item.name : item.name.substring(0, client.config.SONG_MAX_LENGTH) + "..."}`, value: item.url } })
    const resultsEmbed = new Discord.MessageEmbed().setAuthor({ name: `${songs[0].name}`, url: songs[0].url, iconURL: client.element.ICON_FLOPY }).setThumbnail(songs[0].thumbnail || client.element.BANNER_SECONDARY).addFields({ name: `**${lang.MESSAGE_SONG_AUTHOR}**`, value: `${songs[0].uploader.name}`, inline: true }, { name: `**${lang.MESSAGE_SONG_VIEWS}**`, value: `${songs[0].views.toString().replace(/(.)(?=(\d{3})+$)/g,'$1,')}`, inline: true }).setColor(client.element.COLOR_FLOPY)
    const resultsMenu = new Discord.MessageActionRow().addComponents({ type: "SELECT_MENU", customId: "PlaySong", options: [results] })
    channel.send({ embeds: [resultsEmbed], components: [resultsMenu] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 10000))
}
module.exports.help = {
    name: "search",
    type: "command",
    description: "HELP_COMMAND_SEARCH",
    usage: " [name]",
}