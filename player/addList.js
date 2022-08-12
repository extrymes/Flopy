const languages = require("../util/languages")

module.exports = async (client, queue, playlist) => {
    const guild = queue.textChannel.guild
    const channel = client.cache["dashboard" + guild.id]?.channel
    const settings = await client.getGuild(guild)
    const lang = languages[settings.flopy1.language]

    client.cache["query" + playlist.member.id] = playlist.url
    if(playlist.metadata.interaction) client.replyMessage(playlist.metadata.interaction, true, `${queue.songs[0] === playlist.songs[0] ? lang.MESSAGE_PLAYLIST_PLAYING : lang.MESSAGE_QUEUE_PLAYLIST_ADDED}`)
    else client.sendMessage(channel, `${lang.MESSAGE_PLAYLIST_PLAYING}`)
}