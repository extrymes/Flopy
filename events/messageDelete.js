const Discord = require('discord.js')

module.exports = async(client, message) => {
    if(message.channel.type === "dm") return

    const guild = message.guild
    const settings = await client.getGuild(guild)

    // DASHBOARD
    if(message.id === settings.dashboardMessage) client.updateGuild(guild, { dashboardMessage: "", dashboardChannel: "" })

}
