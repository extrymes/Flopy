const { Client, GatewayIntentBits, REST, Routes } = require("discord.js")
const { DisTube } = require("distube")
const fs = require ("fs")
const colors = require("colors")

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.MessageContent] })
require("dotenv").config()
require("./util/crash")(client)
require("./util/functions")(client)

client.config = require("./admin/config")
client.mongoose = require("./admin/mongoose")
client.dashboards = new Map()
client.cooldowns = new Map()
client.queries = new Map()
client.distube = new DisTube(client, {
    leaveOnFinish: client.config.DISTUBE_LEAVE_ON_FINISH,
    leaveOnStop: client.config.DISTUBE_LEAVE_ON_STOP,
    emitOnEmpty: client.config.DISTUBE_EMIT_ON_EMPTY,
    emptyCooldown: client.config.DISTUBE_EMPTY_COOLDOWN,
    nsfw: client.config.DISTUBE_NSFW,
    savePreviousSongs: client.config.DISTUBE_SAVE_PREVIOUS_SONGS,
    customFilters: client.config.DISTUBE_CUSTOM_FILTERS,
    youtubeCookie: client.config.DISTUBE_YOUTUBE_COOKIE,
    youtubeIdentityToken: client.config.DISTUBE_YOUTUBE_IDENTITY_TOKEN,
})

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"))
const commands = new Array()
for(const file of commandFiles) {
    const command = require(`./commands/${file}`)
    commands.push(command.data)
}
console.log(`[-] Commands: ${commandFiles.length}`)

const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"))
for(const file of eventFiles) {
    const event = require(`./events/${file}`)
    client.on(file.split(".")[0], event.bind(null, client))
}
console.log(`[-] Events: ${eventFiles.length}`)

const playerFiles = fs.readdirSync("./player").filter(file => file.endsWith(".js"))
for(const file of playerFiles) {
    const event = require(`./player/${file}`)
    client.distube.on(file.split(".")[0], event.bind(null, client))
}
console.log(`[-] Player: ${playerFiles.length}`)

const rest = new REST({ version: 10 }).setToken(process.env.TOKEN)
try {
    rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands })
} catch(error) {
    console.warn(error)
}

client.mongoose.init()
client.login(process.env.TOKEN)