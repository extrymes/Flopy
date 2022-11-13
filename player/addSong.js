const languages = require("../util/languages")

module.exports = async (client, queue, song) => {
    const guild = queue.textChannel.guild
    const channel = client.cache["dashboard" + guild.id]?.channel
    const settings = await client.getGuild(guild)
    const lang = languages[settings.flopy1.language]
    
    client.cache["query" + song.member.id] = song.url
    if(queue.songs[0] === song) {
        if(song.metadata.interaction) client.replyMessage(song.metadata.interaction, true, `${lang.MESSAGE_SONG_PLAYING}`)
        else client.sendMessage(channel, `${lang.MESSAGE_SONG_PLAYING}`)
    } else {
        client.editDashboard(guild, queue, lang)
        if(song.metadata.interaction) client.replyMessage(song.metadata.interaction, true, `${lang.MESSAGE_QUEUE_SONG_ADDED} (#${queue.songs.indexOf(song)})`)
        else client.sendMessage(channel, `${lang.MESSAGE_QUEUE_SONG_ADDED} (#${queue.songs.indexOf(song)})`)
    }
}