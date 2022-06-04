module.exports = async (client, guild) => {
    delete client.cache["dashboard" + guild.id]
}