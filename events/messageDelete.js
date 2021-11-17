module.exports = async(client, message) => {
    if(message.channel.type === "dm") return

    const guild = message.guild
    const settings = await client.getGuild(guild)

    if(message.id === settings.dashboardMessage1) client.updateGuild(guild, { dashboardMessage1: "", dashboardChannel1: "" })
}
