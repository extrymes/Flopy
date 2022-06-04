const Discord = require("discord.js")
const fs = require ("fs")
const colors = require("colors")

const client = new Discord.Client({ partials: ["CHANNEL", "MESSAGE"], intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"] })
require("./util/crash")(client)
require("./util/functions")(client)

client.config = require("./admin/config")
client.elements = require("./util/elements")
client.mongoose = require("./admin/mongoose")
client.cache = {}

const { DisTube } = require("distube")
client.distube = new DisTube(client, {
    leaveOnFinish: client.config.DISTUBE_LEAVE_ON_FINISH,
    leaveOnStop: client.config.DISTUBE_LEAVE_ON_STOP,
    stopOnEmpty: client.config.DISTUBE_STOP_ON_EMPTY,
    emptyCooldown: client.config.DISTUBE_EMPTY_COOLDOWN,
    nsfw: client.config.DISTUBE_NSFW,
    customFilters: client.config.DISTUBE_CUSTOM_FILTERS,
    youtubeDL: client.config.DISTUBE_YOUTUBE_DL,
    updateYouTubeDL: client.config.DISTUBE_UPDATE_YOUTUBE_DL,
    youtubeCookie: client.config.DISTUBE_YOUTUBE_COOKIE,
    youtubeIdentityToken: client.config.DISTUBE_YOUTUBE_IDENTITY_TOKEN,
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
        command.data.type = "command"
        client.commands.set(command.data.name, command)
    })
})

fs.readdir("./filters/", (error, f) => {
    const commands = f.filter(f => f.split(".").pop() ==="js")
    if(error) console.log(error)
    console.log(`[-] Filters: ${f.length}`)
    commands.forEach((f) => {
        const command = require(`./filters/${f}`)
        command.data.type = "filter"
        client.commands.set(command.data.name, command)
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

client.mongoose.init()
client.login(client.config.TOKEN)
