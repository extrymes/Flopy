module.exports = async (client, queue) => {
    if(queue.songs[0]) client.distube.stop(queue)
}