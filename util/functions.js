const Discord = require("discord.js")
const mongoose = require("mongoose")
const guild = require("../models/guild")
const { Guild, User } = require("../models/index")

const dashboard = {}
const cooldown = {}

module.exports = client => {
    // Create guild in the database
    client.createGuild = async guild => {
        const newGuild = { guildID: guild.id }
        const merged = Object.assign({ _id: mongoose.Types.ObjectId() }, newGuild)
        const createGuild = await new Guild(merged)
        createGuild.save().then(g => console.log(`[+] New server`.blue))
    }

    // Get guild in the database
    client.getGuild = async guild => {
        const data = await Guild.findOne({ guildID: guild.id })
        if (data) return data
        return false
    }

    // Update guild in the database
    client.updateGuild = async (guild, settings) => {
        let data = await client.getGuild(guild)
        if (typeof data !== "object") data = {}
        for (const key in settings) {
            if (data[key] !== settings[key]) data[key] = settings[key]
        }
        return data.updateOne(settings)
    }

    // Create user in the database
    client.createUser = async user => {
        const newUser = { userID: user.id }
        const merged = Object.assign({ _id: mongoose.Types.ObjectId() }, newUser)
        const createUser = await new User(merged)
        createUser.save().then(g => console.log(`[+] New user`.blue))
    }

    // Get user in the database
    client.getUser = async user => {
        const data = await User.findOne({ userID: user.id })
        if (data) return data
        return false
    }

    // Update user in the database
    client.updateUser = async (user, settings) => {
        let data = await client.getUser(user)
        if (typeof data !== "object") data = {}
        for (const key in settings) {
            if (data[key] !== settings[key]) data[key] = settings[key]
        }
        return data.updateOne(settings)
    }

    // Delete user in the database
    client.deleteUser = async user => {
        await User.deleteOne({ userID: user.id }).then(console.log(`[~] Old user`.blue))
    }

    // Cooldown
    client.cooldown = (id, time) => {
    	if(cooldown[id]) return true
        else {
            cooldown[id] = true
            setTimeout(() => cooldown[id] = undefined, time)
            return false
        }
    }

    // Send correct
    client.sendCorrect = async (channel, content) => {
        const correctEmbed = new Discord.MessageEmbed().setTitle(`${content}`).setColor(client.element.COLOR_FLOPY)
        channel?.send({ embeds: [correctEmbed] }).catch(error => {}).then(m => setTimeout(() => { m?.delete().catch(error => {}) }, 5000))
    }

    // Send error
    client.sendError = async (channel, content) => {
        const errorEmbed = new Discord.MessageEmbed().setTitle(`${content}`).setColor(client.element.COLOR_GREY)
        channel?.send({ embeds: [errorEmbed] }).catch(error => {}).then(m => setTimeout(() => { m?.delete().catch(error => {}) }, 5000))
    }

    // Reply error
    client.replyError = async (interaction, content) => {
        const errorEmbed = new Discord.MessageEmbed().setTitle(`${content}`).setColor(client.element.COLOR_GREY)
        interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(error => {})
    }

    // First message
    client.firstMessage = async guild => {
        let firstChannel = false
        const firstEmbed = new Discord.MessageEmbed().setTitle(`Get ready to listen to some music!`).setDescription(`Thank you for adding me to your server.\nTo start listening to music, mention me in a channel.`).setImage(client.element.BANNER_FLOPY).setColor(client.element.COLOR_FLOPY)
        guild.channels.cache.forEach(channel => {
            if(!firstChannel && channel.type === "GUILD_TEXT" && channel.viewable && channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
                firstChannel = true
                channel.send({ embeds: [firstEmbed] }).catch(error => {})
            }
        })
    }

    // Setup dashboard
    client.setupDashboard = async (guild, settings, channel) => {
        const langEmbed = new Discord.MessageEmbed().setTitle(`Choose a language`).setImage(client.element.BANNER_DASHBOARD).setColor(client.element.COLOR_FLOPY)
        const langButtons = new Discord.MessageActionRow().addComponents(new Discord.MessageButton().setCustomId(`Lang("en")`).setStyle(`SECONDARY`).setEmoji(client.element.EMOJI_LANG_EN), new Discord.MessageButton().setCustomId(`Lang("fr")`).setStyle(`SECONDARY`).setEmoji(client.element.EMOJI_LANG_FR))
        const oldChannel = guild.channels.cache.find(ch => ch.id === settings.dashboard1.channel)
        await oldChannel?.messages?.fetch(settings.dashboard1.message).catch(error => {}).then(oldDashboard => oldDashboard?.delete().catch(error => {}))
        channel.send({ embeds: [langEmbed] }).catch(error => {}).then(async dashboardMessage => {
            await client.updateGuild(guild, { dashboard1: { channel: dashboardMessage?.channel?.id, message: dashboardMessage?.id, language: settings.dashboard1.language } })
            await client.getDashboard(guild, settings, dashboardMessage)
            dashboardMessage?.edit({ embeds: [langEmbed], components: [langButtons] }).catch(error => {})
        })
    }

    // Get dashboard
    client.getDashboard = async (guild, settings, message) => {
        if(message) dashboard[guild.id] = message
        else {
            const dashboardChannel = guild.channels.cache.find(ch => ch.id === settings.dashboard1.channel)
            dashboardChannel?.messages?.fetch(settings.dashboard1.message).catch(error => {}).then(dashboardMessage => {
                if(dashboardMessage) dashboard[guild.id] = dashboardMessage
                else client.updateGuild(guild, { dashboard1: client.config.GUILD_DEFAULTSETTINGS.dashboard1 })
            })
        }
    }

    // Update dashboard
    client.updateDashboard = async (guild, queue, lang) => {
        console.log(true)
        const song = queue?.songs[0]
        const dashboardEmbed = new Discord.MessageEmbed()
        const dashboardButtons = new Discord.MessageActionRow()
        if(song) {
            const songs = queue.songs.slice(1, client.config.QUEUE_MAX_DISPLAY + 1).map((m, i) => { return `${i + 1}. ${m?.name}` }).reverse().join("\n")
            const queueCount = queue.songs.length - 1
            const queueList = `${queueCount > client.config.QUEUE_MAX_DISPLAY ? `\n**+${queueCount - client.config.QUEUE_MAX_DISPLAY} ${lang.DASHBOARD_QUEUE_MORE}**\n${songs}` : `\n${songs || lang.DASHBOARD_QUEUE_NO_SONG}`}`
            const color = `${queue.paused ? client.element.COLOR_GREY_2 : client.element.COLOR_WHITE}`
            const repeat = `${lang.DASHBOARD_REPEAT} ${queue.repeatMode === 0 ? lang.DASHBOARD_REPEAT_OFF : queue.repeatMode === 1 ? lang.DASHBOARD_REPEAT_SONG : lang.DASHBOARD_REPEAT_QUEUE}`
            const volume = `${lang.DASHBOARD_VOLUME} ${queue.volume}%`
            dashboardEmbed.setTitle(`[${song.formattedDuration}] ${song.name}`).setImage(song.thumbnail || client.element.BANNER_DASHBOARD_2).setFooter(`${repeat} | ${volume}`, song.member.avatarURL() || song.member.user.avatarURL() || client.element.AVATAR_DEFAULT).setColor(color)
            dashboardButtons.addComponents(new Discord.MessageButton().setCustomId(`PlayPause()`).setStyle(`SECONDARY`).setEmoji(client.element.EMOJI_PLAY_PAUSE), new Discord.MessageButton().setCustomId(`Stop()`).setStyle(`SECONDARY`).setEmoji(client.element.EMOJI_STOP), new Discord.MessageButton().setCustomId(`Skip()`).setStyle(`SECONDARY`).setEmoji(client.element.EMOJI_NEXT), new Discord.MessageButton().setCustomId(`Repeat()`).setStyle(`SECONDARY`).setEmoji(client.element.EMOJI_REPEAT), new Discord.MessageButton().setCustomId(`Volume()`).setStyle(`SECONDARY`).setEmoji(client.element.EMOJI_VOLUME))
            dashboard[guild.id]?.edit({ content: `**__${lang.DASHBOARD_QUEUE}__** ${queueList}`, embeds: [dashboardEmbed], components: [dashboardButtons] }).catch(error => {})
        } else {
            dashboardEmbed.setTitle(`${lang.DASHBOARD_SONG_NO_PLAYING}`).setDescription(`[Flopy](${client.config.INVITE_FLOPY}) | [Flopy 2](${client.config.INVITE_FLOPY2}) | [Flopy 3](${client.config.INVITE_FLOPY3})`).setImage(client.element.BANNER_DASHBOARD).setColor(client.element.COLOR_FLOPY)
            dashboardButtons.addComponents(new Discord.MessageButton().setCustomId(`PlayPause()`).setStyle(`SECONDARY`).setEmoji(client.element.EMOJI_PLAY_PAUSE).setDisabled(), new Discord.MessageButton().setCustomId(`Stop()`).setStyle(`SECONDARY`).setEmoji(client.element.EMOJI_STOP).setDisabled(), new Discord.MessageButton().setCustomId(`Skip()`).setStyle(`SECONDARY`).setEmoji(client.element.EMOJI_NEXT).setDisabled(), new Discord.MessageButton().setCustomId(`Repeat()`).setStyle(`SECONDARY`).setEmoji(client.element.EMOJI_REPEAT).setDisabled(), new Discord.MessageButton().setCustomId(`Volume()`).setStyle(`SECONDARY`).setEmoji(client.element.EMOJI_VOLUME).setDisabled())
            dashboard[guild.id]?.edit({ content: `**__${lang.DASHBOARD_QUEUE}__**\n${lang.DASHBOARD_QUEUE_DEFAULT}`, embeds: [dashboardEmbed], components: [dashboardButtons] }).catch(error => {})
        }
    }

    // Send commands
    client.sendCommands = async (lang, channel) => {
        const commandsEmbed = new Discord.MessageEmbed().setTitle(`${lang.COMMAND_TITLE}`).setDescription(`**${client.config.PREFIX}info** ${lang.COMMAND_INFO}\n**${client.config.PREFIX}seek** ${lang.COMMAND_SEEK}\n**${client.config.PREFIX}auto** ${lang.COMMAND_AUTOPLAY}\n**${client.config.PREFIX}fav** ${lang.COMMAND_FAVORITE}\n**${client.config.PREFIX}mix** ${lang.COMMAND_MIX}`).setColor(client.element.COLOR_FLOPY)
        channel.send({ embeds: [commandsEmbed] }).catch(error => {}).then(m => setTimeout(() => { m?.delete().catch(error => {}) }, 8000))
    }

    // Leave channel
    client.leaveChannel = async guild => {
        client.distube.voices.leave(guild)
    }

    // Play song
    client.playSong = async message => {
        message.channel.sendTyping().catch(error => {})
        try {
            client.distube.voices.join(message.member.voice.channel)
            client.distube.play(message, message.content)
        } catch(error) { client.distube.emit("error", message.channel, error) }
    }

    // Play favorite songs
    client.playFavoriteSongs = async (message, favorites) => {
        message.channel.sendTyping().catch(error => {})
        try {
            client.distube.voices.join(message.member.voice.channel)
            client.distube.playCustomPlaylist(message, favorites)
        } catch(error) { client.distube.emit("error", message.channel, error) }
    }

    // PlayPause song
    client.playPauseSong = async (guild, queue, lang) => {
        if(queue.playing) client.distube.pause(queue)
        else client.distube.resume(queue)
        client.updateDashboard(guild, queue, lang)
    }

    // Pause song
    client.pauseSong = async (guild, queue, lang) => {
        if(queue.playing) {
            client.distube.pause(queue)
            client.updateDashboard(guild, queue, lang)
        }
    }

    // Stop song
    client.stopSong = async queue => {
        client.distube.stop(queue)
    }

    // Skip song
    client.skipSong = async queue => {
        client.distube.skip(queue).catch(error => {})
        if(queue.songs.length - 1 > 0 && queue.paused) client.distube.resume(queue)
    }

    // Repeat song
    client.repeatSong = async (guild, queue, lang) => {
        const repeatMode = queue.repeatMode
        client.distube.setRepeatMode(queue, repeatMode === 0 ? 1 : repeatMode === 1 ? 2 : 0)
        client.updateDashboard(guild, queue, lang)
    }

    // Volume song
    client.volumeSong = async (guild, queue, lang) => {
        const volume = queue.volume
        client.distube.setVolume(queue, volume === 50 ? 25 : volume === 25 ? 75 : volume === 75 ? 100 : 50)
        client.updateDashboard(guild, queue, lang)
    }

    // Info song
    client.infoSong = async (queue, lang, channel) => {
        const song = queue.songs[0]
        let percentage = ((queue.currentTime / song.duration) * 100).toFixed(0)
        let progress = ""
        for(i = 0; i < 20; i++) {
            if(percentage >= 5) {
                percentage = percentage - 5
                progress = progress + client.element.SYMBOL_LINE
            } else if(percentage !== -1) {
                percentage = -1
                progress = progress + client.element.SYMBOL_CIRCLE
            } else progress = progress + " "
        }
        const bar = `\`[${progress}][${queue.formattedCurrentTime}/${song.formattedDuration}]\``
        const infoEmbed = new Discord.MessageEmbed().setTitle(`${song.name}`).setURL(song.url).setThumbnail(song.thumbnail || client.element.BANNER_DASHBOARD_2).addFields({ name: `**${lang.SONG_AUTHOR}**`, value: `${song.uploader?.name || "?"}`, inline: true }, { name: `**${lang.SONG_VIEWS}**`, value: `${song.views || "?"}`, inline: true }, { name: `**${lang.SONG_LIKES}**`, value: `${song.likes || "?"}`, inline: true }, { name: `**${lang.SONG_DURATION}**`, value: `${bar}` }).setColor(client.element.COLOR_FLOPY)
        channel.send({ embeds: [infoEmbed] }).catch(error => {}).then(m => setTimeout(() => { m?.delete().catch(error => {}) }, 8000))
    }

    // Seek song
    client.seekSong = async (queue, lang, channel, time) => {
        if(time > -1) {
            try {
                client.distube.seek(queue, time)
                client.sendCorrect(channel, `${lang.SONG_MOMENT_SEEKED}`)
            } catch(error) { client.distube.emit("error", channel, error) }
        } else {
            const song = queue.songs[0]
            const optionsArray = []
            for(i = 0; i < 20; i++) {
                const calculedTime = (((i * 5) / 100) * song.duration).toFixed(0)
                const formatInt = (int) => (int < 10 ? `0${int}` : int)
                const seconds = Math.round(calculedTime % 60)
                const minutes = Math.floor((calculedTime % 3600) / 60)
                const hours = Math.floor(calculedTime / 3600)
                if (hours > 0) formattedTime = `${formatInt(hours)}:${formatInt(minutes)}:${formatInt(seconds)}`
                else if (minutes > 0) formattedTime = `${formatInt(minutes)}:${formatInt(seconds)}`
                else formattedTime =  `00:${formatInt(seconds)}`
                optionsArray.push({ label: `${formattedTime}`, value: calculedTime })
            }
            const seekMenu = new Discord.MessageActionRow().addComponents(new Discord.MessageSelectMenu().setCustomId(`Seek()`).setPlaceholder(`${lang.SONG_SELECT_MOMENT}`).addOptions([optionsArray]))
            channel.send({ content: `ㅤ`, components: [seekMenu] }).catch(error => {}).then(m => setTimeout(() => { m?.delete().catch(error => {}) }, 10000))
        }
    }

    // AutoPlay song
    client.autoPlaySong = async (queue, lang, channel) => {
        const autoplay = client.distube.toggleAutoplay(queue)
        client.sendCorrect(channel, `${autoplay ? lang.SONG_AUTOPLAY_ENABLED : lang.SONG_AUTOPLAY_DISABLED}`)
    }

    // Favorites songs
    client.favoriteSongs = async (user, lang, channel, songURL) => {
        const userData = await client.getUser(user)
        if(!userData) {
            await client.createUser(user)
            setTimeout(() => { client.updateUser(user, { favorites: [ songURL ] }) }, 500)
            client.sendCorrect(channel, `${lang.SONG_FAVORITES_ADDED}`)
        } else {
            const favorites = userData.favorites
            if(!favorites.find(url => url === songURL)) {
                favorites.push(songURL)
                await client.updateUser(user, { favorites: favorites })
                client.sendCorrect(channel, `${lang.SONG_FAVORITES_ADDED}`)
            } else {
                const index = favorites.indexOf(songURL)
                favorites.splice(index, 1)
                if(favorites.length > 0) await client.updateUser(user, { favorites: favorites })
                else await client.deleteUser(user)
                client.sendCorrect(channel, `${lang.SONG_FAVORITES_REMOVED}`)
            }
        }
    }

    // Mix queue
    client.mixQueue = async (guild, queue, lang, channel) => {
        await client.distube.shuffle(queue)
        const newQueue = client.distube.getQueue(guild)
        client.updateDashboard(guild, newQueue, lang)
        client.sendCorrect(channel, `${lang.SONG_QUEUE_MIXED}`)
    }
}