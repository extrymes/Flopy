module.exports = async (client, queue) => {
    const guild = queue.textChannel.guild
    const channel = client.cache["dashboard" + guild.id]?.channel
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.flopy1.language}`)

    client.sendError(channel, `${lang.ERROR_SONG_NO_RELATED_FOUND}`)
}