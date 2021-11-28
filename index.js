const Discord = require("discord.js")
const {Client, Intents, Collection } = require('discord.js')
const fs = require ("fs")

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'], intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] })
require("./util/functions")(client)

client.config = require("./admin/config")
client.element = require("./util/elements")
client.mongoose = require("./admin/mongoose")

client.mongoose.init()
client.login(client.config.TOKEN)

const DisTube = require("distube")
const { SpotifyPlugin } = require("@distube/spotify")
client.distube = new DisTube.default(client, {
    leaveOnFinish: false,
    leaveOnStop: false,
    pauseOnEmpty: true,
    emitNewSongOnly: false,
    searchSongs: 0,
    searchCooldown: 60,
    emptyCooldown: 60,
    nsfw: true,
    youtubeDL: true,
    updateYouTubeDL: true,
    youtubeCookie: client.config.YOUTUBE_COOKIE,
    plugins: [new SpotifyPlugin({ emitEventsAfterFetching: true })],
})

const songEvents = [
    "playSong",
    "addSong",
    "addList",
    "deleteQueue",
    "empty",
    "searchNoResult",
    "error",
]

client.commands = new Discord.Collection()

fs.readdir("./commands/", (error, f) => {
    if(error) console.log(error)

    let commandes = f.filter(f => f.split(".").pop() ==="js")
    if(commandes.length <= 0) return console.log("[!] No commands in this folder".red)

    commandes.forEach((f) => {
        let commande = require (`./commands/${f}`)
        
        console.log(`[-] Command: ${f}`)

    client.commands.set(commande.help.name, commande)
    })
})

fs.readdir("./events", (error, f) => {
    if(error) console.log(error)
    console.log(`[-] Events: ${f.length}`)

    f.forEach((f) => {
        const events = require(`./events/${f}`)
        const event = f.split(".")[0]

    if(songEvents.find(evt => evt === event)) client.distube.on(event, events.bind(null, client))
    else client.on(event, events.bind(null, client))
    })
})
