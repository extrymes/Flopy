module.exports = async (client, queue, song) => {
    const guild = queue.guild
    client.updateDashboard(guild)
}