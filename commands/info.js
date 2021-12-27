const Discord = require("discord.js")

module.exports.run = async (client, message, args, queue, settings, lang) => {
    const channel = message.channel
    const song = queue?.songs[0]

    if(!song) return client.sendError(channel, `${lang.ERROR_SONG_NO_PLAYING}`)
    const data = await client.getSongData(queue, song)
    const infoEmbed = new Discord.MessageEmbed().setAuthor(`${song.name}`, client.element.ICON_FLOPY, song.url).setThumbnail(song.thumbnail || client.element.BANNER_DASHBOARD_2).addFields({ name: `**${lang.SONG_AUTHOR}**`, value: `${data.author}`, inline: true }, { name: `**${lang.SONG_VIEWS}**`, value: `${data.views}`, inline: true }, { name: `**${lang.SONG_LIKES}**`, value: `${data.likes}`, inline: true }, { name: `**${lang.SONG_DURATION}**`, value: `${data.bar}` }).setColor(client.element.COLOR_FLOPY)
    channel.send({ embeds: [infoEmbed] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 8000))
}
module.exports.help = {
    name: "info",
    type: "command",
    title: "lang.HELP_COMMAND_INFO",
    description: "lang.HELP_COMMAND_INFO_DESCRIPTION",
    usage: "",
}