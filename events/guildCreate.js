module.exports = async (client, guild) => {
    const settings = await client.getGuild(guild)

    if(!settings) {
        await client.createGuild(guild)
        let firstChannel = false
        guild.channels.cache.forEach(channel => {
            if(!firstChannel && channel.type === "GUILD_TEXT" && channel.viewable && channel.permissionsFor(client.user).has("SEND_MESSAGES")) {
                firstChannel = true
                client.firstMessage(channel)
            }
        })
    }
}