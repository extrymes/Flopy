module.exports.run = async (client, message, args, queue, settings, lang) => {
    const guild = message.guild
    const channel = message.channel
    const member = message.member
    const userData = await client.getUser(message.author)
    const save = args.slice(0).join(" ")

    if(save) {
        if(save.length > 90) return client.sendError(channel, `${lang.ERROR_NAME_TOO_LONG}`)
        if(!userData) {
            if(client.cooldown(message.author.id + "save", 2000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
            await client.createUser(message.author)
            setTimeout(() => client.updateUser(message.author, { saved: save }), 1000)
            client.sendCorrect(channel, `${!save.includes("list=") ? lang.SONG_SAVED : lang.PLAYLIST_SAVED}`)
        } else {
            if(save.toLowerCase() === userData.saved.toLowerCase()) return client.sendError(channel, `${!save.includes("list=") ? lang.ERROR_SONG_ALREADY_SAVED : lang.ERROR_PLAYLIST_ALREADY_SAVED}`)
            if(client.cooldown(message.author.id + "save", 2000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
            client.updateUser(message.author, { saved: save })
            client.sendCorrect(channel, `${!save.includes("list=") ? lang.SONG_SAVED : lang.PLAYLIST_SAVED}`)
        }
    } else {
        if(!userData) return client.sendError(channel, `${lang.ERROR_NO_SAVE}`)
        if(client.checkChannel(guild, member)) {
            if(client.cooldown(message.author.id + "play", 2000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
            channel.sendTyping().catch(error => {})
            try { client.distube.play(member.voice.channel, userData.saved, { textChannel: channel, member: member }) } catch(error) { client.distube.emit("error", channel, error) }
        } else if(!queue) {
            if(member.voice.channel) {
                if(client.cooldown(message.author.id + "play", 2000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
                client.distube.voices.leave(guild)
                channel.sendTyping().catch(error => {})
                try { client.distube.play(member.voice.channel, userData.saved, { textChannel: channel, member: member }) } catch(error) { client.distube.emit("error", channel, error) }
            } else client.sendError(channel, `${lang.ERROR_USER_NO_CHANNEL}`)
        } else client.sendError(channel, `${lang.ERROR_USER_NO_CORRECT_CHANNEL}`)
    }
}
module.exports.help = {
    name: "save",
    type: "command",
    title: "lang.HELP_COMMAND",
    description: "lang.HELP_COMMAND_SAVE",
    usage: " <name|url>",
}