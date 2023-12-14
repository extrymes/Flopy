const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const { DisTube } = require("distube");
const mongoose = require("mongoose");
const fs = require("fs");
const colors = require("colors");

// Create client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.MessageContent] });
require("dotenv").config();
require("./utils/crash")(client);
require("./utils/functions")(client);

// Configure client
client.config = require("./admin/config");
client.dashboards = new Map();
client.cooldowns = new Map();
client.queries = new Map();
client.emptyTimeouts = {};
client.distube = new DisTube(client, {
  leaveOnFinish: client.config.DISTUBE_LEAVE_ON_FINISH,
  leaveOnStop: client.config.DISTUBE_LEAVE_ON_STOP,
  leaveOnEmpty: client.config.DISTUBE_LEAVE_ON_EMPTY,
  nsfw: client.config.DISTUBE_NSFW,
  savePreviousSongs: client.config.DISTUBE_SAVE_PREVIOUS_SONGS,
  customFilters: client.config.DISTUBE_CUSTOM_FILTERS,
  youtubeCookie: JSON.parse(fs.readFileSync("./admin/ytCookies.json"))
});

// Read command files
const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"));
const commands = new Array();
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data);
}
console.log(`[-] Commands: ${commandFiles.length}`);

// Read event files
const eventFiles = fs.readdirSync("./events").filter((file) => file.endsWith(".js"));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  client.on(file.split(".")[0], event.bind(null, client));
}
console.log(`[-] Events: ${eventFiles.length}`);

// Read player files
const playerFiles = fs.readdirSync("./player").filter((file) => file.endsWith(".js"));
for (const file of playerFiles) {
  const event = require(`./player/${file}`);
  client.distube.on(file.split(".")[0], event.bind(null, client));
}
console.log(`[-] Player: ${playerFiles.length}`);

// Deploy commands
const rest = new REST({ version: 10 }).setToken(process.env.BOT_TOKEN);
try {
  rest.put(Routes.applicationCommands(process.env.APP_ID), { body: commands });
} catch (error) {
  console.error(error);
}

// Connect database
mongoose.connect(process.env.MONGO_CONNECTION, {
  autoIndex: client.config.MONGO_AUTO_INDEX,
  maxPoolSize: client.config.MONGO_MAX_POOL_SIZE,
  serverSelectionTimeoutMS: client.config.MONGO_SERVER_SELECTION_TIMEOUT_MS,
  socketTimeoutMS: client.config.MONGO_SOCKET_TIMEOUT_MS,
  family: client.config.MONGO_FAMILY,
}).then(() => console.log("[-] Flopy is connected to the database".green)).catch((error) => console.error(error));

// Login client
client.login(process.env.BOT_TOKEN);