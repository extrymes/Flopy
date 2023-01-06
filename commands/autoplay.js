const languages = require("../util/languages")

module.exports.run = async (client, interaction, settings, queue, lang) => {
    const { guild, member } = interaction

    if(!queue?.songs[0]) return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_NO_PLAYING}`)
    if(!client.checkVoice(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`)
    if(!client.manageCooldown("autoplay", guild.id, 2000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`)
    const autoplay = client.distube.toggleAutoplay(queue)
    client.editDashboard(guild, queue, lang)
    client.sendNotification(interaction, `${autoplay ? lang.MESSAGE_AUTOPLAY_ENABLED : lang.MESSAGE_AUTOPLAY_DISABLED}`)
}
module.exports.data = {
    name: "autoplay",
    description: languages["en"].COMMAND_AUTOPLAY_DESCRIPTION,
    description_localizations: { "fr": languages["fr"].COMMAND_AUTOPLAY_DESCRIPTION },
    dm_permission: false,
}