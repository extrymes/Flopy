const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder } = require("discord.js")

module.exports.run = async (client, message, args, settings, queue, lang) => {
    const { guild, channel, member } = message
    const name = args.slice(0).join(" ")

    if(!member.voice.channel) return client.sendError(channel, `${lang.ERROR_USER_NO_VOICE}`)
    if(!client.checkVoice(guild, member) && queue) return client.sendError(channel, `${lang.ERROR_USER_NO_VOICE_2}`)
    if(!name) return client.sendHelpMessage(channel, lang, client.commands.get("search"))
    if(client.cooldown("search" + member.id, 10000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
    channel.sendTyping().catch(error => {})
    const songs = await client.distube.search(name).catch(error => client.distube.emit("error", channel, error))
    if(!songs[0]) return
    const results = songs.map((item, i) => { return { label: `${i + 1}. ${item.name.length <= client.config.SONG_MAX_LENGTH ? item.name : item.name.substring(0, client.config.SONG_MAX_LENGTH) + "..."}`, value: item.url } })
    const searchEmbed = new EmbedBuilder().setAuthor({ name: `${songs[0].name}`, url: songs[0].url, iconURL: client.elements.ICON_FLOPY }).setThumbnail(songs[0].thumbnail || client.elements.BANNER_SECONDARY).addFields({ name: `**${lang.MESSAGE_SONG_AUTHOR}**`, value: `${songs[0].uploader.name}`, inline: true }, { name: `**${lang.MESSAGE_SONG_VIEWS}**`, value: `${songs[0].views.toString().replace(/(.)(?=(\d{3})+$)/g,"$1,")}`, inline: true }).setColor(client.elements.COLOR_FLOPY)
    const resultsMenu = new ActionRowBuilder().addComponents(new SelectMenuBuilder().setCustomId("play").setOptions(results))
    channel.send({ embeds: [searchEmbed], components: [resultsMenu] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 10000))
}
module.exports.data = {
    name: "search",
    description: "HELP_COMMAND_SEARCH",
    usage: " [name]",
}