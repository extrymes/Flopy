const languages = require("../utils/languages");

module.exports = async (client, message) => {
  const { guild, channel, member } = message;
  const guildData = await client.getGuildData(guild);
  const queue = client.distube.getQueue(guild);
  const lang = languages[guildData.language];

  if (message.author.bot) return;

  if (channel === client.dashboards.get(guild.id)?.channel) {
    if (member.voice.channel) {
      if (client.checkMemberIsInMyVoiceChannel(guild, member) || !queue) {
        if (client.manageCooldown("play", member.id, 2000)) {
          await channel.sendTyping().catch((error) => { });
          client.distube.play(member.voice.channel, message.content, { textChannel: channel, member: member }).catch((error) => {
            const errorMessage = client.getErrorMessage(error.message, lang);
            client.sendErrorNotification(channel, `${errorMessage}`);
          });
        } else client.sendErrorNotification(channel, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
      } else client.sendErrorNotification(channel, `${lang.ERROR_MEMBER_MUST_JOIN_MY_VOICE_CHANNEL}`);
    } else client.sendErrorNotification(channel, `${lang.ERROR_MEMBER_MUST_JOIN_VOICE_CHANNEL}`);
    message.delete().catch((error) => { });
  } else if (message.mentions.users.first() === client.user && client.manageCooldown("help", member.id, 4000)) client.sendHelpMessage(guild, channel, lang);
}