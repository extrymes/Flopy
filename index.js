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
    leaveOnFinish: client.config.DISTUBE_LEAVE_ON_FINISH,
    leaveOnStop: client.config.DISTUBE_LEAVE_ON_STOP,
    pauseOnEmpty: client.config.DISTUBE_PAUSE_ON_EMPTY,
    emitNewSongOnly: client.config.DISTUBE_EMIT_NEW_SONG_ONLY,
    searchSongs: client.config.DISTUBE_SEARCH_SONG,
    searchCooldown: client.config.DISTUBE_SEARCH_COOLDOWN,
    emptyCooldown: client.config.DISTUBE_EMPTY_COOLDOWN,
    nsfw: client.config.DISTUBE_NSFW,
    youtubeDL: client.config.DISTUBE_YOUTUBE_DL,
    updateYouTubeDL: client.config.DISTUBE_UPDATE_YOUTUBE_DL,
    youtubeCookie: client.config.DISTUBE_YOUTUBE_COOKIE,
    plugins: [new SpotifyPlugin({ emitEventsAfterFetching: client.config.SPOTIFY_EMIT_EVENTS_AFTER_FETCHING })],
})

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

    if(client.config.DISTUBE_EVENTS.find(evt => evt === event)) client.distube.on(event, events.bind(null, client))
    else client.on(event, events.bind(null, client))
    })
})
