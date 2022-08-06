module.exports.run = async (client, interaction, settings, queue, lang) => {
    const { guild, member, options } = interaction
    const song = queue?.songs[0]
    const time = options.getInteger("time").toString()

    if(!song) return client.replyError(interaction, false, `${lang.ERROR_SONG_NO_PLAYING}`)
    if(!client.checkVoice(guild, member)) return client.replyError(interaction, false, `${lang.ERROR_USER_NO_VOICE_2}`)
    if(song.isLive) return client.replyError(interaction, false, `${lang.ERROR_ACTION_NOT_POSSIBLE}`)
    const sec = await client.convertTime(time)
    if(sec > song.duration) return client.replyError(interaction, false, `${lang.ERROR_SONG_TIME_GREATER}`)
    if(client.cooldown("seek" + guild.id, 4000)) return client.replyError(interaction, false, `${lang.ERROR_ACTION_TOO_FAST}`)
    client.distube.seek(queue, sec)
    if(queue.paused) {
        client.distube.resume(queue)
        client.updateDashboard(guild, queue, lang)
    }
    const bar = await client.createBar(queue)
    client.replyMessage(interaction, false, `${bar}`)
}
module.exports.data = {
    name: "seek",
    description: languages["en"].COMMAND_SEEK_DESCRIPTION,
    description_localizations: { "fr": languages["fr"].COMMAND_SEEK_DESCRIPTION },
    options: [
        {
            name: "time",
            description: languages["en"].COMMAND_SEEK_OPTION,
            description_localizations: { "fr": languages["fr"].COMMAND_SEEK_OPTION },
            type: 4,
            required: true,
        },
    ],
    dm_permission: false,
}