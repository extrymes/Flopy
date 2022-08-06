module.exports.run = async (client, interaction, settings, queue, lang) => {
    const { guild, member } = interaction

    if(!queue?.songs[1]) return client.replyError(interaction, false, `${lang.ERROR_QUEUE_NO_SONG}`)
    if(!client.checkVoice(guild, member)) return client.replyError(interaction, false, `${lang.ERROR_USER_NO_VOICE_2}`)
    if(client.cooldown("shuffle" + guild.id, 2000)) return client.replyError(interaction, false, `${lang.ERROR_ACTION_TOO_FAST}`)
    await client.distube.shuffle(queue)
    client.updateDashboard(guild, queue, lang)
    client.replyMessage(interaction, false, `${lang.MESSAGE_QUEUE_SHUFFLED}`)
}
module.exports.data = {
    name: "shuffle",
    description: languages["en"].COMMAND_SHUFFLE_DESCRIPTION,
    description_localizations: { "fr": languages["fr"].COMMAND_SHUFFLE_DESCRIPTION },
    dm_permission: false,
}