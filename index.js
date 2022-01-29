const Discord = require("discord.js")
const { Client, Intents, Collection } = require("discord.js")
const fs = require ("fs")

const client = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"], intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] })
require("./util/crash")(client)
require("./util/functions")(client)

client.config = require("./admin/config")
client.element = require("./util/elements")
client.mongoose = require("./admin/mongoose")

client.mongoose.init()
client.login(client.config.TOKEN)

const DisTube = require("distube")
client.distube = new DisTube.default(client, {
    leaveOnFinish: client.config.DISTUBE_LEAVE_ON_FINISH,
    leaveOnStop: client.config.DISTUBE_LEAVE_ON_STOP,
    stopOnEmpty: client.config.DISTUBE_STOP_ON_EMPTY,
    emitNewSongOnly: client.config.DISTUBE_EMIT_NEW_SONG_ONLY,
    searchSongs: client.config.DISTUBE_SEARCH_SONGS,
    searchCooldown: client.config.DISTUBE_SEARCH_COOLDOWN,
    emptyCooldown: client.config.DISTUBE_EMPTY_COOLDOWN,
    nsfw: client.config.DISTUBE_NSFW,
    customFilters: client.config.DISTUBE_CUSTOM_FILTERS,
    youtubeDL: client.config.DISTUBE_YOUTUBE_DL,
    updateYouTubeDL: client.config.DISTUBE_UPDATE_YOUTUBE_DL,
    youtubeCookie: client.config.DISTUBE_YOUTUBE_COOKIE,
})

const { DiscordTogether } = require('discord-together')
client.activity = new DiscordTogether(client)

client.commands = new Discord.Collection()

fs.readdir("./commands/", (error, f) => {
    const commands = f.filter(f => f.split(".").pop() ==="js")
    if(error) console.log(error)
    console.log(`[-] Commands: ${f.length}`)
    commands.forEach((f) => {
        const command = require(`./commands/${f}`)
        client.commands.set(command.help.name, command)
    })
})

fs.readdir("./filters/", (error, f) => {
    const commands = f.filter(f => f.split(".").pop() ==="js")
    if(error) console.log(error)
    console.log(`[-] Filters: ${f.length}`)
    commands.forEach((f) => {
        const command = require(`./filters/${f}`)
        client.commands.set(command.help.name, command)
    })
})

fs.readdir("./events", (error, f) => {
    if(error) console.log(error)
    console.log(`[-] Events: ${f.length}`)
    f.forEach((f) => {
        const events = require(`./events/${f}`)
        const event = f.split(".")[0]
        client.on(event, events.bind(null, client))
    })
})

fs.readdir("./player", (error, f) => {
    if(error) console.log(error)
    console.log(`[-] Player: ${f.length}`)
    f.forEach((f) => {
        const events = require(`./player/${f}`)
        const event = f.split(".")[0]
        client.distube.on(event, events.bind(null, client))
    })
})
