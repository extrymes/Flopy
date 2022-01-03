const Discord = require("discord.js")

module.exports.run = async (client, message, args, queue, settings, lang) => {
    const channel = message.channel
    const song = queue?.songs[0]

    if(!song) return client.sendError(channel, `${lang.ERROR_SONG_NO_PLAYING}`)
    const author = song.uploader.name || "?"
    const views = song.views.toString().replace(/(.)(?=(\d{3})+$)/g,'$1,') || "?"
    const likes = song.likes.toString().replace(/(.)(?=(\d{3})+$)/g,'$1,') || "?"
    const bar = await client.createBar(queue, song)
    const infoEmbed = new Discord.MessageEmbed().setAuthor({ name: `${song.name}`, url: song.url, iconURL: client.element.ICON_FLOPY }).setThumbnail(song.thumbnail || client.element.BANNER_DASHBOARD_2).addFields({ name: `**${lang.SONG_AUTHOR}**`, value: `${author}`, inline: true }, { name: `**${lang.SONG_VIEWS}**`, value: `${views}`, inline: true }, { name: `**${lang.SONG_LIKES}**`, value: `${likes}`, inline: true }, { name: `**${lang.SONG_DURATION}**`, value: `${bar}` }).setColor(client.element.COLOR_FLOPY)
    channel.send({ embeds: [infoEmbed] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 8000))
}
module.exports.help = {
    name: "info",
    type: "command",
    title: "lang.HELP_COMMAND",
    description: "lang.HELP_COMMAND_INFO",
    usage: "",
}