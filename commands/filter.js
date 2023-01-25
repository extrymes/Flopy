const { SlashCommandBuilder } = require("discord.js")
const languages = require("../utils/languages")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("filter")
        .setDescription(`${languages["en"].COMMAND_FILTER_DESCRIPTION}`)
        .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_FILTER_DESCRIPTION}` })
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
            .setName("toggle")
            .setDescription(`${languages["en"].COMMAND_FILTER_TOGGLE_DESCRIPTION}`)
            .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_FILTER_TOGGLE_DESCRIPTION}` })
            .addStringOption(option =>
                option
                .setName("name")
                .setDescription(`${languages["en"].COMMAND_FILTER_TOGGLE_OPTION}`)
                .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_FILTER_TOGGLE_OPTION}` })
                .setRequired(true)
                .setChoices({ name: "3d", value: "3d" }, { name: "8d", value: "8d" }, { name: "bassboost", value: "bassboost" }, { name: "subboost", value: "subboost" }, { name: "purebass", value: "purebass" }, { name: "nightcore", value: "nightcore" }, { name: "vaporwave", value: "vaporwave" }, { name: "phaser", value: "phaser" }, { name: "tremolo", value: "tremolo" }, { name: "vibrato", value: "vibrato" }, { name: "pulsator", value: "pulsator" }, { name: "earwax", value: "earwax" }, { name: "echo", value: "echo" }, { name: "fast", value: "fast" }, { name: "flanger", value: "flanger" }, { name: "gate", value: "gate" }, { name: "haas", value: "haas" }, { name: "mcompand", value: "mcompand" })
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName("reset")
            .setDescription(`${languages["en"].COMMAND_FILTER_RESET_DESCRIPTION}`)
            .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_FILTER_RESET_DESCRIPTION}` })
        ),
    run: async (client, interaction, settings, queue, lang) => {
        const { guild, member, options } = interaction
        const subcommand = options.getSubcommand()
        const filters = queue?.filters
        
        switch(subcommand) {
            case "toggle":
                const name = options.getString("name")
                if(!queue?.songs[0]) return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_NO_PLAYING}`)
                if(!client.checkVoice(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`)
                if(!client.manageCooldown("filter", guild.id, 2000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`)
                if(filters.has(name)) filters.remove(name)
                else filters.add(name)
                if(queue.paused) client.distube.resume(queue)
                const items = filters.names.map((item, i) => { return `\`${item}\`` }).join(", ")
                client.editDashboard(guild, queue, lang)
                client.sendNotification(interaction, `${lang.MESSAGE_FILTERS_ACTIVE} ${items || lang.MESSAGE_FILTERS_NONE}`)
                break
            case "reset":
                if(!filters?.size) return client.sendErrorNotification(interaction, `${lang.ERROR_FILTER_NO_ACTIVE}`)
                if(!client.checkVoice(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`)
                if(!client.manageCooldown("filter", guild.id, 2000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`)
                filters.clear()
                if(queue.paused) client.distube.resume(queue)
                client.editDashboard(guild, queue, lang)
                client.sendNotification(interaction, `${lang.MESSAGE_FILTERS_ACTIVE} ${lang.MESSAGE_FILTERS_NONE}`)
                break
            default:
                client.sendErrorNotification(interaction, `${lang.ERROR_UNKNOWN}`)
        }
    }
}