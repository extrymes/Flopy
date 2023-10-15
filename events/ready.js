const languages = require("../utils/languages");

module.exports = (client) => {
    // Status
    console.log(`[-] ${client.user.username} is online`.green);
    setInterval(() => client.user.setPresence({ activities: [{ name: `@${client.user.username}`, type: 2 }], status: "online" }), client.config.PRESENCE_UPDATE_INTERVAL * 1000);

    // Guilds
    console.log("[!] Checking guilds ...".yellow);
    client.guilds.cache.forEach(async (guild) => {
        const settings = await client.getGuild(guild);
        if (!settings) {
            await client.createGuild(guild);
            client.sendFirstMessage(guild);
        } else {
            await client.getDashboard(guild, settings);
            if (client.dashboards.has(guild.id)) {
                const voice = guild.channels.cache.get(settings.flopy1.voice);
                const queue = client.distube.getQueue(guild);
                const lang = languages[settings.flopy1.language];
                client.editDashboard(guild, queue, lang);
                try { client.distube.voices.join(voice).catch((error) => { }) } catch { };
            }
        }
    });
}