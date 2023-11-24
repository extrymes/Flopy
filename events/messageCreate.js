const languages = require("../utils/languages");

module.exports = async (client, message) => {
  const { guild, channel, member } = message;
  const settings = await client.getGuild(guild);
  const queue = client.distube.getQueue(guild);
  const lang = languages[settings?.flopy1?.language];

  if (message.author.bot) return;

  if (channel === client.dashboards.get(guild.id)?.channel) {
    if (member.voice.channel) {
      if (client.checkVoice(guild, member) || !queue) {
        if (client.manageCooldown("play", member.id, 2000)) {
          await channel.sendTyping().catch((error) => { });
          client.distube.play(member.voice.channel, message.content, { textChannel: channel, member: member }).catch((error) => {
            const errorMessage = client.getErrorMessage(error.message, lang);
            client.sendErrorNotification(channel, `${errorMessage}`);
          });
        } else client.sendErrorNotification(channel, `${lang.ERROR_ACTION_NOT_POSSIBLE}`);
      } else client.sendErrorNotification(channel, `${lang.ERROR_USER_MUST_JOIN_VOICE_2}`);
    } else client.sendErrorNotification(channel, `${lang.ERROR_USER_MUST_JOIN_VOICE}`);
    message.delete().catch((error) => { });
  } else if (message.mentions.users.first() === client.user && client.manageCooldown("help", member.id, 4000)) client.sendHelpMessage(guild, channel, lang);
}