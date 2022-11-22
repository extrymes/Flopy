const languages = require("../util/languages")

module.exports.run = async (client, interaction, settings, queue, lang) => {
    const { guild, member, options } = interaction
    const position = options.getInteger("position")

    if(!queue?.songs[1]) return client.replyError(interaction, false, `${lang.ERROR_QUEUE_NO_SONG}`)
    if(!client.checkVoice(guild, member)) return client.replyError(interaction, false, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`)
    if(position < 1 || position > queue.songs.length - 1) return client.replyError(interaction, false, `${lang.ERROR_SONG_INVALID_POSITION}`)
    if(client.cooldown("jump" + guild.id, 2000)) return client.replyError(interaction, false, `${lang.ERROR_ACTION_TOO_FAST}`)
    client.distube.jump(queue, position)
    if(queue.paused) client.distube.resume(queue)
    client.replyMessage(interaction, false, `${position === 1 ? lang.MESSAGE_SONG_SKIPPED : lang.MESSAGE_SONG_SKIPPED_2.replace("$position", `#${position}`)}`)
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