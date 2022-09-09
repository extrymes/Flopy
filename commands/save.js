const languages = require("../util/languages")

module.exports.run = async (client, interaction, settings, queue, lang) => {
    const { guild, channel, member, options } = interaction
    const data = await client.getUser(member)
    const query = options.getString("query")

    if(query) {
        if(query.length > 90) return client.replyError(interaction, false, `${lang.ERROR_QUERY_TOO_LONG}`)
        if(query === data.query) return client.replyError(interaction, false, `${lang.ERROR_QUERY_ALREADY_SAVED}`)
        if(client.cooldown("save" + member.id, 4000)) return client.replyError(interaction, false, `${lang.ERROR_ACTION_TOO_FAST}`)
        if(data.null) await client.createUser(member)
        setTimeout(() => client.updateUser(member, { query: query }), 1000)
        client.replyMessage(interaction, false, `${lang.MESSAGE_QUERY_SAVED}`)
    } else {
        if(!member.voice.channel) return client.replyError(interaction, false, `${lang.ERROR_USER_NO_VOICE}`)
        if(!client.checkVoice(guild, member) && queue) return client.replyError(interaction, false, `${lang.ERROR_USER_NO_VOICE_2}`)
        if(data.null) return client.replyError(interaction, false, `${lang.ERROR_QUERY_NO_SAVED}`)
        if(client.cooldown("play" + member.id, 2000)) return client.replyError(interaction, false, `${lang.ERROR_ACTION_TOO_FAST}`)
        await interaction.deferReply().catch(error => {})
        client.distube.play(member.voice.channel, data.query, { textChannel: channel, member: member, metadata: { interaction: interaction } }).catch(error => {
            const errorMessage = client.getErrorMessage(error.message, lang)
            client.replyError(interaction, true, `${errorMessage}`)
        })
    }
}
module.exports.data = {
    name: "save",
    description: languages["en"].COMMAND_SAVE_DESCRIPTION,
    description_localizations: { "fr": languages["fr"].COMMAND_SAVE_DESCRIPTION },
    options: [
        {
            name: "query",
            description: languages["en"].COMMAND_SAVE_OPTION,
            description_localizations: { "fr": languages["fr"].COMMAND_SAVE_OPTION },
            type: 3,
            required: false,
        },
    ],
    dm_permission: false,
}