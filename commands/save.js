module.exports.run = async (client, message, args, settings, queue, lang) => {
    const { guild, channel, member, author } = message
    const data = await client.getUser(author)
    const query = args.slice(0).join(" ")

    if(query) {
        if(query.length > 90) return client.sendError(channel, `${lang.ERROR_QUERY_TOO_LONG}`)
        if(client.cooldown("save" + author.id, 4000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
        if(data.null) await client.createUser(author)
        setTimeout(() => client.updateUser(author, { query: query }), 1000)
        client.sendMessage(channel, `${lang.MESSAGE_QUERY_SAVED}`)
    } else {
        if(data.null) return client.sendError(channel, `${lang.ERROR_QUERY_NO_SAVED}`)
        if(!member.voice.channel) return client.sendError(channel, `${lang.ERROR_USER_NO_VOICE}`)
        if(!client.checkVoice(guild, member) && queue) return client.sendError(channel, `${lang.ERROR_USER_NO_VOICE_2}`)
        if(client.cooldown("play" + author.id, 2000)) return client.sendError(channel, `${lang.ERROR_ACTION_TOO_FAST}`)
        channel.sendTyping().catch(error => {})
        if(!client.checkVoice(guild, member)) client.leaveVoice(guild)
        try { client.distube.play(member.voice.channel, data.query, { textChannel: channel, member: member }) } catch(error) { client.distube.emit("error", channel, error) }
    }
}
module.exports.data = {
    name: "save",
    description: "HELP_COMMAND_SAVE",
    usage: " <name|url>",
}