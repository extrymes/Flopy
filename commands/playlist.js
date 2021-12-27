module.exports.run = async (client, message, args, queue, settings, lang) => {
    const guild = message.guild
    const channel = message.channel
    const userData = await client.getUser(message.author)
    const song = queue?.songs[0]
    const action = args[0]

    if(action === "add") {
        if(!song) return client.sendError(channel, `${lang.ERROR_SONG_NO_PLAYING}`)
        if(!userData) {
            await client.createUser(message.author)
            setTimeout(() => client.updateUser(message.author, { playlist: [ song.url ] }), 1000)
            client.sendCorrect(channel, `${lang.SONG_ADDED_TO_PLAYLIST}`)
        } else {
            const userPlaylist = userData.playlist
            if(userPlaylist.find(item => item === song.url)) return client.sendError(channel, `${lang.ERROR_PLAYLIST_SONG_ALREADY_ADDED}`)
            userPlaylist.push(song.url)
            await client.updateUser(message.author, { playlist: userPlaylist })
            client.sendCorrect(channel, `${lang.SONG_ADDED_TO_PLAYLIST}`)
        }
    } else if(action === "remove") {
        if(!song) return client.sendError(channel, `${lang.ERROR_SONG_NO_PLAYING}`)
        const userPlaylist = userData.playlist
        if(!userData || !userPlaylist.find(item => item === song.url)) return client.sendError(channel, `${lang.ERROR_PLAYLIST_SONG_NO_ADDED}`)
        const index = userPlaylist.indexOf(song.url)
        userPlaylist.splice(index, 1)
        if(userPlaylist.length > 0) await client.updateUser(message.author, { playlist: userPlaylist })
        else await client.deleteUser(message.author)
        client.sendCorrect(channel, `${lang.SONG_REMOVED_FROM_PLAYLIST}`)
    } else {
        if(!userData) return client.sendError(channel, `${lang.ERROR_PLAYLIST_NO_SONG}`)
        if(message.member.voice.channel) {
            if(client.checkChannel(guild, message.member)) {
                channel.sendTyping().catch(error => {})
                try { client.distube.playCustomPlaylist(message, userData.playlist) } catch(error) { client.distube.emit("error", channel, error) }
            } else if(!queue) {
                client.distube.voices.leave(guild)
                channel.sendTyping().catch(error => {})
                try { client.distube.playCustomPlaylist(message, userData.playlist) } catch(error) { client.distube.emit("error", channel, error) }
            } else client.sendError(channel, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
        } else client.sendError(channel, `${lang.ERROR_USER_NO_CHANNEL}`)
    }
}
module.exports.help = {
    name: "playlist",
    type: "command",
    title: "lang.HELP_COMMAND_PLAYLIST",
    description: "lang.HELP_COMMAND_PLAYLIST_DESCRIPTION",
    usage: " <add|remove>",
}