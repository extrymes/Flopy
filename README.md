# Flopy
A Discord Music Bot that supports multiple platforms and is easy to use with its clean dashboard and simple commands.

[Discord Bot Invite](https://discord.com/api/oauth2/authorize?client_id=909205146863566858&permissions=3172352&scope=bot%20applications.commands)

![banner](https://i.imgur.com/a084EZ1.jpg)

## ✨ Features
- Easy to use and setup
- Clean dashboard and nice look
- Simple commands
- Supports Youtube, Spotify and Tidal URLs
- Custom library to save songs and playlists
- 18 audio filters (bassboost, nightcore, vaporwave, ...)
- Autoplay related songs
- Up to 3 clients to play music in multiple voice channels at the same time
- Speaks multiple languages (English & French)

## 📦 Requirement
- [Node.js](https://nodejs.org) v18.17.0 or higher
- [FFmpeg](https://ffmpeg.org)
- [discord.js](https://discord.js.org) v14
- [@discordjs/opus](https://github.com/discordjs/opus)
- [@discordjs/voice](https://github.com/discordjs/voice)
- [distube](https://distube.js.org) v5
- [@distube/ytdl-core](https://github.com/distubejs/ytdl-core)
- [@distube/youtube](https://github.com/distubejs/extractor-plugins/tree/main/packages/youtube)
- [@distube/spotify](https://github.com/distubejs/extractor-plugins/tree/main/packages/spotify)
- [distube-tidal](https://github.com/LakhindarPal/distube-tidal)
- [sodium-native](https://github.com/holepunchto/sodium-native)
- [node-mongodb-native](https://github.com/mongodb/node-mongodb-native)
- [mongoose](https://mongoosejs.com/)

## 🚀 Getting started
Make sure you have [Node.js](https://nodejs.org/en/download) and [FFmpeg](https://ffmpeg.org/download.html) installed before proceeding.
1. Clone this repository
```bash
git clone https://github.com/extrymes/Flopy.git
cd Flopy
```
2. Install dependencies
```bash
npm install
```
3. Create `.env` file containing the required environment variables (see below)
```bash
touch .env
```
4. Run the bot
```bash
node index.js
```
Now you just have to add the bot to your server and use the `/setup` command in a channel.

## ⚙️ Configuration
These keys are necessary for the project and must be declared as environment variables in the `.env` file.
<table>
	<thead>
		<tr>
			<th>Variable name</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><code>APP_ID</code></td>
			<td>The Discord Application ID</td>
		</tr>
		<tr>
			<td><code>BOT_TOKEN</code></td>
			<td>The Discord Bot Token</td>
		</tr>
		<tr>
			<td><code>MONGO_CONNECTION</code></td>
			<td>The MongoDB connection string (take a look at <a href="https://mongodb.com/docs/manual/reference/connection-string">MongoDB Manual</a>)</td>
		</tr>
	</tbody>
</table>

Optional: You can paste your Youtube cookies into `admin/ytCookies.json`.
> [!NOTE]
> Cookies prevent Youtube rate limiting (429 Error) and are able to play videos accessible via your account, including age-restricted videos, exclusive member videos, premium videos, private videos and many more.
### 🍪 How to get cookies
1. Install [EditThisCookie](https://editthiscookie.com) extension on your browser
2. Go to Youtube
3. Log in to your account
4. Click on the extension icon and click "Export" icon
5. Your cookies will be added to your clipboard

## 📸 Showcase
![exemple](https://i.imgur.com/R7N9vIn.jpg)
