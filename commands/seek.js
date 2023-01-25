const { SlashCommandBuilder } = require("discord.js")
const languages = require("../utils/languages")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("seek")
        .setDescription(`${languages["en"].COMMAND_SEEK_DESCRIPTION}`)
        .setDescriptionLocalizations({ "fr": `${languages["en"].COMMAND_SEEK_DESCRIPTION}` })
        .setDMPermission(false)
        .addIntegerOption(option =>
            option
            .setName("hms")
            .setDescription(`${languages["en"].COMMAND_SEEK_OPTION}`)
            .setDescriptionLocalizations({ "fr": `${languages["en"].COMMAND_SEEK_OPTION}` })
            .setRequired(true)
        ),
    run: async (client, interaction, settings, queue, lang) => {
        const { guild, member, options } = interaction
        const song = queue?.songs[0]
        const hms = options.getInteger("hms").toString()
        
        if(!song) return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_NO_PLAYING}`)
        if(!client.checkVoice(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`)
        if(song.isLive) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`)
        const sec = client.convertHMSToSeconds(hms)
        if(sec > song.duration) return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_TIME_GREATER}`)
        if(!client.manageCooldown("seek", guild.id, 4000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`)
        client.distube.seek(queue, sec)
        if(queue.paused) {
            client.distube.resume(queue)
            client.editDashboard(guild, queue, lang)
        }
        const durationBar = client.createDurationBar(queue)
        client.sendNotification(interaction, `${durationBar}`)
    }
}