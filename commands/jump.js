const languages = require("../util/languages")

module.exports.run = async (client, interaction, settings, queue, lang) => {
    const { guild, member, options } = interaction
    const position = options.getInteger("position")
    const song = queue?.songs[position]

    if(!song) return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_INVALID_POSITION}`)
    if(!client.checkVoice(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`)
    if(!client.manageCooldown("jump", guild.id, 2000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`)
    client.distube.jump(queue, position)
    if(queue.paused) client.distube.resume(queue)
    client.sendAdvancedNotification(interaction, `${lang.MESSAGE_SONG_SKIPPED.replace("$position", `#${position}`)}`, song.name, song.thumbnail)
}
module.exports.data = {
    name: "jump",
    description: languages["en"].COMMAND_JUMP_DESCRIPTION,
    description_localizations: { "fr": languages["fr"].COMMAND_JUMP_DESCRIPTION },
    options: [
        {
            name: "position",
            description: languages["en"].COMMAND_JUMP_OPTION,
            description_localizations: { "fr": languages["fr"].COMMAND_JUMP_OPTION },
            type: 4,
            required: true,
        },
    ],
    dm_permission: false,
}