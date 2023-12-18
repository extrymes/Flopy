const { SlashCommandBuilder } = require("discord.js");
const languages = require("../utils/languages");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription(`${languages["en"].COMMAND_REMOVE_DESCRIPTION}`)
    .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_REMOVE_DESCRIPTION}` })
    .setDMPermission(false)
    .addSubcommand(subcommand =>
      subcommand
        .setName("song")
        .setDescription(`${languages["en"].COMMAND_REMOVE_SONG_DESCRIPTION}`)
        .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_REMOVE_SONG_DESCRIPTION}` })
        .addIntegerOption(option =>
          option
            .setName("position")
            .setDescription(`${languages["en"].COMMAND_REMOVE_SONG_OPTION}`)
            .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_REMOVE_SONG_OPTION}` })
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("all")
        .setDescription(`${languages["en"].COMMAND_REMOVE_ALL_DESCRIPTION}`)
        .setDescriptionLocalizations({ "fr": `${languages["fr"].COMMAND_REMOVE_ALL_DESCRIPTION}` })
    ),
  run: async (client, interaction, guildData, queue, lang) => {
    const { guild, member, options } = interaction;
    const subcommand = options.getSubcommand();

    switch (subcommand) {
      case "song":
        const position = options.getInteger("position");
        const song = queue?.songs[position];
        if (!song) return client.sendErrorNotification(interaction, `${lang.ERROR_SONG_INVALID_POSITION}`);
        if (!client.checkMemberIsInMyVoiceChannel(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
        if (!client.handleCooldown("removeCommand", guild.id, 2000)) return client.sendErrorNotification(interaction, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
        // Remove song from queue
        queue.songs.splice(position, 1);
        // Update dashboard message and send advanced notification
        client.updateDashboardMessage(guild, queue, lang);
        client.sendAdvancedNotification(interaction, `${lang.MESSAGE_QUEUE_SONG_REMOVED} (#${position})`, `${song.name}`, song.thumbnail);
        break;
      case "all":
        if (!queue?.songs[1]) return client.sendErrorNotification(interaction, `${lang.ERROR_QUEUE_NO_SONG}`);
        if (!client.checkMemberIsInMyVoiceChannel(guild, member)) return client.sendErrorNotification(interaction, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
        // Remove all songs from queue
        queue.songs = [queue.songs[0]];
        // Update dashboard message and send notification
        client.updateDashboardMessage(guild, queue, lang);
        client.sendNotification(interaction, `${lang.MESSAGE_QUEUE_CLEARED}`);
        break;
      default:
        client.sendErrorNotification(interaction, `${lang.ERROR_UNKNOWN}`);
    }
  }
}