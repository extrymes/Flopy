const languages = require("../util/languages")

module.exports.run = async (client, interaction, settings, queue, lang) => {
    const { guild, member, options } = interaction
    const subcommand = options.getSubcommand()

    switch(subcommand) {
        case "toggle":
            const name = options.getString("name")
            if(!queue?.songs[0]) return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_NO_PLAYING}`)
            if(!client.checkVoice(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`)
            if(!client.manageCooldown("filter", guild.id, 2000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`)
            if(queue.filters.has(name)) queue.filters.remove(name)
            else queue.filters.add(name)
            if(queue.paused) client.distube.resume(queue)
            const filters = queue.filters.names.map((item, i) => { return `\`${item}\`` }).join(", ")
            client.editDashboard(guild, queue, lang)
            client.sendNotification(interaction, `${lang.MESSAGE_FILTERS_ACTIVE} ${queue.filters.size ? filters : lang.MESSAGE_FILTERS_NONE}`)
            break
        case "reset":
            if(!queue?.filters?.size) return client.sendErrorNotification(interaction, `${lang.ERROR_FILTER_NO_ACTIVE}`)
            if(!client.checkVoice(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`)
            if(!client.manageCooldown("filter", guild.id, 2000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`)
            queue.filters.clear()
            if(queue.paused) client.distube.resume(queue)
            client.editDashboard(guild, queue, lang)
            client.sendNotification(interaction, `${lang.MESSAGE_FILTERS_ACTIVE} ${lang.MESSAGE_FILTERS_NONE}`)
            break
        default:
            client.sendErrorNotification(interaction, `${lang.ERROR_UNKNOWN}`)
    }
}
module.exports.data = {
    name: "filter",
    description: languages["en"].COMMAND_FILTER_DESCRIPTION,
    description_localizations: { "fr": languages["fr"].COMMAND_FILTER_DESCRIPTION },
    options: [
        {
            name: "toggle",
            description: languages["en"].COMMAND_FILTER_TOGGLE_DESCRIPTION,
            description_localizations: { "fr": languages["fr"].COMMAND_FILTER_TOGGLE_DESCRIPTION },
            type: 1,
            options: [
                {
                    name: "name",
                    description: languages["en"].COMMAND_FILTER_TOGGLE_OPTION,
                    description_localizations: { "fr": languages["fr"].COMMAND_FILTER_TOGGLE_OPTION },
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
        },
        {
            name: "reset",
            description: languages["en"].COMMAND_FILTER_RESET_DESCRIPTION,
            description_localizations: { "fr": languages["fr"].COMMAND_FILTER_RESET_DESCRIPTION },
            type: 1,
        },
    ],
    dm_permission: false,
}