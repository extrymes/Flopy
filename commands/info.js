const Discord = require("discord.js")

module.exports.run = async (client, message, args, settings, queue, lang) => {
    const guild = message.guild
    const channel = message.channel
    const song = queue?.songs[0]

    if(!queue) return client.sendError(channel, `${lang.ERROR_SONG_NO_PLAYING}`)
    if(client.cooldown("info" + guild.id, 8000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
    const bar = await client.createBar(queue)
    const infoEmbed = new Discord.MessageEmbed().setAuthor({ name: `${song.name}`, url: song.url, iconURL: client.element.ICON_FLOPY }).setThumbnail(song.thumbnail || client.element.BANNER_SECONDARY).addFields({ name: `**${lang.MESSAGE_SONG_AUTHOR}**`, value: `${song.uploader.name}`, inline: true }, { name: `**${lang.MESSAGE_SONG_VIEWS}**`, value: `${song.views.toString().replace(/(.)(?=(\d{3})+$)/g,'$1 ')}`, inline: true }, { name: `**${lang.MESSAGE_SONG_LIKES}**`, value: `${song.likes.toString().replace(/(.)(?=(\d{3})+$)/g,'$1 ')}`, inline: true }, { name: `**${lang.MESSAGE_SONG_DURATION}**`, value: `${bar}` }).setColor(client.element.COLOR_FLOPY)
    channel.send({ embeds: [infoEmbed] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 8000))
}
module.exports.help = {
    name: "info",
    description: "HELP_COMMAND_INFO",
    usage: "",
}