const { SlashCommandBuilder } = require("discord.js")
const languages = require("../utils/languages")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("jump")
        .setDescription(`${languages["en"].COMMAND_JUMP_DESCRIPTION}`)
        .setDescriptionLocalizations({ "fr": `${languages["en"].COMMAND_JUMP_DESCRIPTION}` })
        .setDMPermission(false)
        .addIntegerOption(option =>
            option
            .setName("position")
            .setDescription(`${languages["en"].COMMAND_JUMP_OPTION}`)
            .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_JUMP_OPTION}` })
            .setRequired(true)
        ),
    run: async (client, interaction, settings, queue, lang) => {
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
}