module.exports = async (client, guild) => {
    await client.deleteGuild(guild)
}