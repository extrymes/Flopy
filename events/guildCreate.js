module.exports = async (client, guild) => {
    const settings = await client.getGuild(guild)
    if(!settings) client.createGuild(guild)
}