module.exports = async (client, queue) => {
    try { client.distube.stop(queue) } catch (error) { }
}