module.exports = async (client, guild) => {
    const settings = await client.getGuild(guild)
    if(!settings) {
        await client.createGuild(guild)
    } else {
		await client.deleteGuild(guild)
		await client.createGuild(guild)
	}
}