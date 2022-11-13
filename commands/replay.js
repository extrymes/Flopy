const languages = require("../util/languages")

module.exports.run = async (client, interaction, settings, queue, lang) => {
    const { guild, member } = interaction
    const song = queue?.songs[0]

    if(!song) return client.replyError(interaction, false, `${lang.ERROR_SONG_NO_PLAYING}`)
    if(!client.checkVoice(guild, member)) return client.replyError(interaction, false, `${lang.ERROR_USER_NO_VOICE_2}`)
    if(song.isLive) return client.replyError(interaction, false, `${lang.ERROR_ACTION_NOT_POSSIBLE}`)
    if(client.cooldown("replay" + guild.id, 4000)) return client.replyError(interaction, false, `${lang.ERROR_ACTION_TOO_FAST}`)
    client.distube.seek(queue, 0)
    if(queue.paused) {
        client.distube.resume(queue)
        client.editDashboard(guild, queue, lang)
    }
    client.replyMessage(interaction, false, `${lang.MESSAGE_SONG_REPLAYED}`)
}
module.exports.data = {
    name: "replay",
    description: languages["en"].COMMAND_REPLAY_DESCRIPTION,
    description_localizations: { "fr": languages["fr"].COMMAND_REPLAY_DESCRIPTION },
    dm_permission: false,
}