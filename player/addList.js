const languages = require("../utils/languages");

module.exports = async (client, queue, playlist) => {
  const guild = queue.textChannel.guild;
  const destination = playlist.metadata || client.dashboards[guild.id]?.channel;
  const guildData = await client.getGuildData(guild);
  const lang = languages[guildData.language];

  // Update member last query
  client.queries[playlist.member.id] = playlist.url;
  // Remove excess songs from queue if limit is reached
  if (queue.songs.length - 1 > client.config.QUEUE_MAX_LENGTH) queue.songs.splice(queue.songs.indexOf(playlist.songs[0]) > 1 ? 1 : client.config.QUEUE_MAX_LENGTH + 1, queue.songs.length - 1 - client.config.QUEUE_MAX_LENGTH);
  if (!destination) return;
  // Send advanced notification and update dashboard message
  if (queue.songs[0] === playlist.songs[0]) return setTimeout(() => client.sendAdvancedNotification(destination, `${lang.MESSAGE_PLAYLIST_PLAYING}`, `${playlist.name}`, playlist.thumbnail, { editReply: true }), 1000);
  client.editDashboardMessage(guild, queue, lang);
  client.sendAdvancedNotification(destination, `${lang.MESSAGE_QUEUE_PLAYLIST_ADDED} (#${queue.songs.indexOf(playlist.songs[0])})`, `${playlist.name}`, playlist.thumbnail, { editReply: true });
}