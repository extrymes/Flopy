module.exports = async (client, queue, playlist) => {
    const guild = queue.guild
    client.updateDashboard(guild)e
    if(queue?.songs?.length === playlist?.songs?.length) client.sendCommands(guild)
}