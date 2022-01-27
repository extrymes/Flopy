module.exports = async (client, queue) => {
    client.distube.stop(queue)
}