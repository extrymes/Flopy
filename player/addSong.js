const languages = require("../utils/languages");

module.exports = async (client, queue, song) => {
    const guild = queue.textChannel.guild;
    const destination = song.metadata || client.dashboards.get(guild.id)?.channel;
    const settings = await client.getGuild(guild);
    const lang = languages[settings.flopy1.language];

    client.queries.set(song.member.id, song.url);
    if (queue.songs.length - 1 > client.config.QUEUE_MAX_LENGTH) queue.songs.splice(queue.songs.indexOf(song) > 1 ? 1 : client.config.QUEUE_MAX_LENGTH + 1, queue.songs.length - 1 - client.config.QUEUE_MAX_LENGTH);
    if (queue.songs[0] !== song) {
        client.editDashboard(guild, queue, lang);
        client.sendAdvancedNotification(destination, `${lang.MESSAGE_QUEUE_SONG_ADDED} (#${queue.songs.indexOf(song)})`, `${song.name}`, song.thumbnail, true);
    } else setTimeout(() => client.sendAdvancedNotification(destination, `${lang.MESSAGE_SONG_PLAYING}`, `${song.name}`, song.thumbnail, true), 1000);
}