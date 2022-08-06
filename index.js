const { Client, GatewayIntentBits, Partials, Collection, REST, Routes } = require("discord.js")
const { DisTube } = require("distube")
const fs = require ("fs")
const colors = require("colors")

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.MessageContent], partials: [Partials.Channel, Partials.Message] })
require("./util/crash")(client)
require("./util/functions")(client)

client.commands = new Collection()
client.config = require("./admin/config")
client.elements = require("./util/elements")
client.mongoose = require("./admin/mongoose")
client.cache = {}

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
const commandsData = []
for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
    client.commands.set(command.data.name, command)
	commandsData.push(command.data)
}
console.log(`[-] Commands: ${commandFiles.length}`)

fs.readdir("./events", (error, f) => {
    if(error) console.log(error)
    console.log(`[-] Events: ${f.length}`)
    f.forEach((f) => {
        const events = require(`./events/${f}`)
        const event = f.split(".")[0]
        client.on(event, events.bind(null, client))
    })
})

const rest = new REST({ version: 10 }).setToken(client.config.TOKEN)
try {
    rest.put(Routes.applicationCommands(client.config.CLIENT_ID), { body: commandsData })
} catch(error) {
    console.log(error)
}

client.mongoose.init()
client.login(client.config.TOKEN)