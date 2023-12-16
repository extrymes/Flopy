const languages = require("../utils/languages");

module.exports = async (client, queue, song) => {
  const guild = queue.textChannel.guild;
  const destination = song.metadata || client.dashboards[guild.id]?.channel;
  const guildData = await client.getGuildData(guild);
  const lang = languages[guildData.language];

  client.queries[song.member.id] = song.url;
  if (queue.songs.length - 1 > client.config.QUEUE_MAX_LENGTH) queue.songs.splice(queue.songs.indexOf(song) > 1 ? 1 : client.config.QUEUE_MAX_LENGTH + 1, queue.songs.length - 1 - client.config.QUEUE_MAX_LENGTH);
  if (!destination) return;
  if (queue.songs[0] === song) return setTimeout(() => client.sendAdvancedNotification(destination, `${lang.MESSAGE_SONG_PLAYING}`, `${song.name}`, song.thumbnail, { editReply: true }), 1000);
  client.editDashboardMessage(guild, queue, lang);
  client.sendAdvancedNotification(destination, `${lang.MESSAGE_QUEUE_SONG_ADDED} (#${queue.songs.indexOf(song)})`, `${song.name}`, song.thumbnail, { editReply: true });
}