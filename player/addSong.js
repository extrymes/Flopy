const languages = require("../util/languages")

module.exports = async (client, queue, song) => {
    const guild = queue.textChannel.guild
    const channel = client.cache["dashboard" + guild.id]?.channel
    const settings = await client.getGuild(guild)
    const lang = languages[settings.flopy1.language]
    
    client.cache["query" + song.member.id] = song.url
    if(song.metadata.interaction) client.replyMessage(song.metadata.interaction, true, `${queue.songs[0] === song ? lang.MESSAGE_SONG_PLAYING : lang.MESSAGE_QUEUE_SONG_ADDED}`)
    else client.sendMessage(channel, `${lang.MESSAGE_SONG_PLAYING}`)
}