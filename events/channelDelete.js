module.exports = async (client, channel) => {
    const guild = channel.guild;

    if (channel === client.dashboards.get(guild.id)?.channel) {
        client.dashboards.delete(guild.id);
        client.leaveVoice(guild);
    }
}