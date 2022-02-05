const Discord = require("discord.js")

module.exports.run = async (client, message, args, queue, settings, lang) => {
    const guild = message.guild
    const channel = message.channel
    const member = message.member
    const query = args.slice(0).join(" ")

    if(client.checkChannel(guild, member)) Search()
    else if(!queue) {
        if(member.voice.channel) Search()
        else client.sendError(channel, `${lang.ERROR_USER_NO_CHANNEL}`)
    } else client.sendError(channel, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)

    async function Search() {
        if(!query) return client.help(lang, channel, client.commands.get("search"))
        if(client.cooldown(guild.id + "search", 10000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
        channel.sendTyping().catch(error => {})
        const songs = await client.distube.search(query).catch(error => client.distube.emit("error", channel, error))
        if(songs[0]) {
            const results = songs.map((item, i) => { return { label: `${i + 1}. ${item.name.length > client.config.SONG_MAX_LENGTH ? item.name.substring(0, client.config.SONG_MAX_LENGTH) + "..." : item.name}`, value: item.url } })
            const resultsEmbed = new Discord.MessageEmbed().setAuthor({ name: `${lang.SONG_FOUND_2}`, iconURL: client.element.ICON_FLOPY }).setThumbnail(songs[0].thumbnail || client.element.BANNER_DASHBOARD_2).setColor(client.element.COLOR_FLOPY)
            const resultsMenu = new Discord.MessageActionRow().addComponents(new Discord.MessageSelectMenu().setCustomId("PlaySong()").addOptions(results))
            channel.send({ embeds: [resultsEmbed], components: [resultsMenu] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 10000))
        }
    }
}
module.exports.help = {
    name: "search",
    type: "command",
    title: "lang.HELP_COMMAND",
    description: "lang.HELP_COMMAND_SEARCH",
    usage: " [name]",
}