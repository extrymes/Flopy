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

const { Player } = require("discord-music-player")
const player = new Player(client, {
    quality: "high",
    leaveOnEnd: false,
    leaveOnStop: false,
    leaveOnEmpty: false,
    deafenOnJoin: true,
})
client.player = player

const musicEvents = [
    "songAdd",
    "playlistAdd",
    "songChanged",
    "queueEnd",
    "queueDestroyed",
    "clientDisconnect",
    "clientUndeafen",
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

    if(musicEvents.find(evt => evt === event)) client.player.on(event, events.bind(null, client))
    else client.on(event, events.bind(null, client))
    })
})
