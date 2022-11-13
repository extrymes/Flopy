const languages = require("../util/languages")

module.exports.run = async (client, interaction, settings, queue, lang) => {
    const { guild, member, options } = interaction
    const name = options.getString("name")

    if(!queue?.songs[0]) return client.replyError(interaction, false, `${lang.ERROR_SONG_NO_PLAYING}`)
    if(!client.checkVoice(guild, member) && queue) return client.replyError(interaction, false, `${lang.ERROR_USER_NO_VOICE_2}`)
    if(client.cooldown("filters" + guild.id, 2000)) return client.replyError(interaction, false, `${lang.ERROR_ACTION_TOO_FAST}`)
    if(queue.filters.has(name)) queue.filters.remove(name)
    else queue.filters.add(name)
    if(queue.paused) client.distube.resume(queue)
    const filters = queue.filters.names.map((item, i) => { return `\`${item}\`` }).join(", ")
    client.editDashboard(guild, queue, lang)
    client.replyMessage(interaction, false, `${lang.MESSAGE_FILTERS_ACTIVE} ${queue.filters.size > 0 ? filters : lang.MESSAGE_FILTERS_NONE}`)
}
module.exports.data = {
    name: "filter",
    description: languages["en"].COMMAND_FILTER_DESCRIPTION,
    description_localizations: { "fr": languages["fr"].COMMAND_FILTER_DESCRIPTION },
    options: [
        {
            name: "name",
            description: languages["en"].COMMAND_FILTER_OPTION,
            description_localizations: { "fr": languages["fr"].COMMAND_FILTER_OPTION },
            type: 3,
            required: true,
            choices: [
                {
                    name: "3d",
                    value: "3d",
                },
                {
                    name: "8d",
                    value: "8d",
                },
                {
                    name: "bassboost",
                    value: "bassboost",
                },
                {
                    name: "subboost",
                    value: "subboost",
                },
                {
                    name: "purebass",
                    value: "purebass",
                },
                {
                    name: "nightcore",
                    value: "nightcore",
                },
                {
                    name: "vaporwave",
                    value: "vaporwave",
                },
                {
                    name: "phaser",
                    value: "phaser",
                },
                {
                    name: "tremolo",
                    value: "tremolo",
                },
                {
                    name: "vibrato",
                    value: "vibrato",
                },
                {
                    name: "pulsator",
                    value: "pulsator",
                },
                {
                    name: "earwax",
                    value: "earwax",
                },
                {
                    name: "echo",
                    value: "echo",
                },
                {
                    name: "fast",
                    value: "fast",
                },
                {
                    name: "flanger",
                    value: "flanger",
                },
                {
                    name: "gate",
                    value: "gate",
                },
                {
                    name: "haas",
                    value: "haas",
                },
                {
                    name: "mcompand",
                    value: "mcompand",
                },
            ],
        },
    ],
    dm_permission: false,
}