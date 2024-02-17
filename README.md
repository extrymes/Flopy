# Flopy
A Discord Music Bot that supports Youtube and is easy to use with its clean dashboard and simple commands.

[Discord Invite](https://discord.com/api/oauth2/authorize?client_id=909205146863566858&permissions=3172352&scope=bot%20applications.commands) | [Discord Support Server](https://discord.gg/cEzzFUnYvb)

![banner](https://i.imgur.com/qyqUfyM.png)

## ✨ Features
- Easy to use and setup
- Clean dashboard and nice look
- Simple commands
- Youtube link support
- Custom library to save songs and playlists
- 18 audio filters (bassboost, nightcore, vaporwave, ...)
- Autoplay related songs
- Supports 3 clients to play music in multiple voice channels at the same time
- Multi-language support (English & French)

## 📦 Dependencies
- [Node.js](https://nodejs.org) v16.11.0 or higher
- [FFmpeg](https://ffmpeg.org)
- [discord.js](https://discord.js.org) v14
- [distube](https://distube.js.org) v4
- [@discordjs/opus](https://github.com/discordjs/opus)
- [@discordjs/voice](https://github.com/discordjs/voice)
- [libsodium-wrappers](https://npmjs.com/package/libsodium-wrappers)
- [node-mongodb-native](https://github.com/mongodb/node-mongodb-native)
- [mongoose](https://github.com/Automattic/mongoose)

## 🛠️ Installation
Make sure you have Node.js and FFmpeg installed before proceeding.
- Run this to install packages:
```bash
npm install
```
## ⚙️ Configuration
These keys must be present in the `.env` file or declared as environment variables:
- `APP_ID`: The Discord application ID
- `BOT_TOKEN`: The Discord bot token
- `MONGO_CONNECTION`: The MongoDB connection string

Take a look at [MongoDB Manual](https://mongodb.com/docs/manual/reference/connection-string) for more details about connection strings.

Optional: You can paste your Youtube cookies into `admin/ytCookies.json`
> [!NOTE]
> Cookies prevent Youtube rate limiting (429 Error) and are able to play videos accessible via your account, including age-restricted videos, exclusive member videos, premium videos, private videos and many more.
### 🍪 How to get cookies
1. Install [EditThisCookie](https://editthiscookie.com) extension on your browser
2. Go to Youtube
3. Log in to your account
4. Click on the extension icon and click "Export" icon
5. Your cookies will be added to your clipboard
## 🔥 Launch
```bash
node index.js
```
## 🚀 Getting Started
1. Add Flopy to your server
2. Use `/setup` command in a channel
3. Join a voice channel and send a song name or a link
4. Listen

## 📸 Showcase
![exemple](https://i.imgur.com/4DFXmxF.png)