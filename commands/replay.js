const { SlashCommandBuilder } = require("discord.js");
const languages = require("../utils/languages");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("replay")
        .setDescription(`${languages["en"].COMMAND_REPLAY_DESCRIPTION}`)
        .setDescriptionLocalizations({ "fr": `${languages["en"].COMMAND_REPLAY_DESCRIPTION}` })
        .setDMPermission(false),
    run: async (client, interaction, settings, queue, lang) => {
        const { guild, member } = interaction;
        const currentSong = queue?.songs[0];

        if (!currentSong) return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_NO_PLAYING}`);
        if (!client.checkVoice(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`);
        if (currentSong.isLive) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
        if (!client.manageCooldown("replay", guild.id, 4000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
        client.distube.seek(queue, 0);
        if (queue.paused) {
            client.distube.resume(queue);
            client.editDashboard(guild, queue, lang);
        }
        client.sendAdvancedNotification(interaction, `${lang.MESSAGE_SONG_REPLAYED}`, `${currentSong.name}`, currentSong.thumbnail);
    }
}