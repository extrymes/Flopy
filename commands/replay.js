const languages = require("../util/languages")

module.exports.run = async (client, interaction, settings, queue, lang) => {
    const { guild, member } = interaction
    const song = queue?.songs[0]

    if(!song) return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_NO_PLAYING}`)
    if(!client.checkVoice(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`)
    if(song.isLive) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`)
    if(!client.manageCooldown("replay", guild.id, 4000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`)
    client.distube.seek(queue, 0)
    if(queue.paused) {
        client.distube.resume(queue)
        client.editDashboard(guild, queue, lang)
    }
    client.sendNotification(interaction, `${lang.MESSAGE_SONG_REPLAYED}`)
}
module.exports.data = {
    name: "replay",
    description: languages["en"].COMMAND_REPLAY_DESCRIPTION,
    description_localizations: { "fr": languages["fr"].COMMAND_REPLAY_DESCRIPTION },
    dm_permission: false,
}