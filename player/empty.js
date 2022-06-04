module.exports = async (client, queue) => {
    if(queue.playing) client.distube.stop(queue)
}