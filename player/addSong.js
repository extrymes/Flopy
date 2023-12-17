const config = require("../admin/config");
const languages = require("../utils/languages");

module.exports = async (client, queue, song) => {
  const guild = queue.textChannel.guild;
  const destination = song.metadata || queue.textChannel;
  const guildData = await client.getGuildData(guild);
  const lang = languages[guildData.language];
  const songs = queue.songs;

  // Update member last query
  client.queries[song.member.id] = song.url;
  // Remove excess songs from queue if limit is reached
  if (songs.length - 1 > config.QUEUE_MAX_LENGTH) songs.splice(songs.indexOf(song) > 1 ? 1 : config.QUEUE_MAX_LENGTH + 1, songs.length - 1 - config.QUEUE_MAX_LENGTH);
  // Send advanced notification and update dashboard message
  if (songs[0] === song) return setTimeout(() => client.sendAdvancedNotification(destination, `${lang.MESSAGE_SONG_PLAYING}`, `${song.name}`, song.thumbnail, { editReply: true }), 1000);
  client.editDashboardMessage(guild, queue, lang);
  client.sendAdvancedNotification(destination, `${lang.MESSAGE_QUEUE_SONG_ADDED} (#${songs.indexOf(song)})`, `${song.name}`, song.thumbnail, { editReply: true });
}