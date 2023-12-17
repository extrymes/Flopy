const config = require("../admin/config");
const languages = require("../utils/languages");

module.exports = async (client, queue, playlist) => {
  const guild = queue.textChannel.guild;
  const destination = playlist.metadata || queue.textChannel;
  const guildData = await client.getGuildData(guild);
  const lang = languages[guildData.language];
  const songs = queue.songs;

  // Update member last query
  client.queries[playlist.member.id] = playlist.url;
  // Remove excess songs from queue if limit is reached
  if (songs.length - 1 > config.QUEUE_MAX_LENGTH) songs.splice(songs.indexOf(playlist.songs[0]) > 1 ? 1 : config.QUEUE_MAX_LENGTH + 1, songs.length - 1 - config.QUEUE_MAX_LENGTH);
  // Send advanced notification and update dashboard message
  if (songs[0] === playlist.songs[0]) return setTimeout(() => client.sendAdvancedNotification(destination, `${lang.MESSAGE_PLAYLIST_PLAYING}`, `${playlist.name}`, playlist.thumbnail, { editReply: true }), 1000);
  client.editDashboardMessage(guild, queue, lang);
  client.sendAdvancedNotification(destination, `${lang.MESSAGE_QUEUE_PLAYLIST_ADDED} (#${songs.indexOf(playlist.songs[0])})`, `${playlist.name}`, playlist.thumbnail, { editReply: true });
}