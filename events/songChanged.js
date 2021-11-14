module.exports = async (client, queue, newSong, oldSong) => {
    const guild = queue.guild
    client.updateDashboard(guild)
}