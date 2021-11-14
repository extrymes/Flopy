module.exports = async (client, queue) => {
    const guild = queue.guild
    client.musicStop(guild)
}