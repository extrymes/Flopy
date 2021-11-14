module.exports = async (client, queue, playlist) => {
    const guild = queue.guild
    client.updateDashboard(guild)
}