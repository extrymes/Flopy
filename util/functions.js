const Discord = require("discord.js")
const mongoose = require("mongoose")
const { Guild } = require("../models/index")
const { User } = require("../models/index")

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
        const greenEmbed = new Discord.MessageEmbed().setTitle(content).setColor(client.element.COLOR_FLOPY)
        channel?.send({ embeds: [greenEmbed] }).catch(error => {}).then(m => setTimeout(() => { m?.delete().catch(error => {}) }, 5000))
    }

    // Send error
    client.sendError = async (channel, content) => {
        const redEmbed = new Discord.MessageEmbed().setTitle(content).setColor(client.element.COLOR_GREY)
        channel?.send({ embeds: [redEmbed] }).catch(error => {}).then(m => setTimeout(() => { m?.delete().catch(error => {}) }, 5000))
    }

    // Reply correct
    client.replyCorrect = async (interaction, content) => {
        const greenEmbed = new Discord.MessageEmbed().setTitle(content).setColor(client.element.COLOR_FLOPY)
        interaction?.reply({ embeds: [greenEmbed], ephemeral: true }).catch(error => {})
    }

    // Reply error
    client.replyError = async (interaction, content) => {
        const redEmbed = new Discord.MessageEmbed().setTitle(content).setColor(client.element.COLOR_GREY)
        interaction?.reply({ embeds: [redEmbed], ephemeral: true }).catch(error => {})
    }

    // Setup the dashboard
    client.setupDashboard = async (guild, settings, lang, channel) => {
        const langEmbed = new Discord.MessageEmbed().setTitle(`${lang.SETUP_LANG}`).setImage(client.element.IMAGE_BANNER).setColor(client.element.COLOR_FLOPY)
        const langButtons = new Discord.MessageActionRow().addComponents(new Discord.MessageButton().setLabel(lang.SETUP_LANG_EN).setStyle(`SECONDARY`).setCustomId(`Lang("en")`).setEmoji(client.element.EMOJI_LANG_EN), new Discord.MessageButton().setLabel(lang.SETUP_LANG_FR).setStyle(`SECONDARY`).setCustomId(`Lang("fr")`).setEmoji(client.element.EMOJI_LANG_FR))
        const oldChannel = guild.channels.cache.find(ch => ch.id === settings.dashboardChannel1)
        await oldChannel?.messages.fetch(settings.dashboardMessage1).catch(error => {}).then(oldDashboard => oldDashboard?.delete().catch(error => {}))
        channel?.send({ embeds: [langEmbed] }).catch(error => {}).then(async dashboard => {
            await client.updateGuild(guild, { dashboardChannel1: dashboard?.channel?.id, dashboardMessage1: dashboard?.id })
            dashboard?.edit({ embeds: [langEmbed], components: [langButtons] }).catch(error => {})
        })
    }

    // Update the dashboard
    client.updateDashboard = async (queue, settings, lang, channel) => {
        const song = queue?.songs[0]
        const dashbaordEmbed = new Discord.MessageEmbed()
        const dashboardButtons = new Discord.MessageActionRow()
        if(song) {
            const songs = queue?.songs?.slice(1, client.config.QUEUE_MAX_DISPLAY + 1).map((m, i) => { return `${i + 1}. ${m?.name}` }).reverse().join("\n")
            const queueCount = queue?.songs?.length - 1
            const queueList = `${queueCount > client.config.QUEUE_MAX_DISPLAY ? `\n**+${queueCount - client.config.QUEUE_MAX_DISPLAY} ${lang.DASHBOARD_QUEUE_MORE}**\n${songs}` : `\n${songs || lang.DASHBOARD_QUEUE_NO_SONG}`}`
            const status = queue?.paused?.toString().replace("false", `${lang.DASHBOARD_SONG_CURRENT_PLAYING}`).replace("true", `${lang.DASHBOARD_SONG_CURRENT_PAUSED}`)
            const repeat = `${lang.DASHBOARD_REPEAT} ${queue?.repeatMode.toString().replace("0", `${lang.DASHBOARD_REPEAT_OFF}`).replace("1", `${lang.DASHBOARD_REPEAT_SONG}`).replace("2", `${lang.DASHBOARD_REPEAT_QUEUE}`)}`
            const volume = `${lang.DASHBOARD_VOLUME} ${queue?.volume}%`
            dashbaordEmbed.setTitle(`[${song?.formattedDuration}] ${song?.name}`).setImage(song?.thumbnail || client.element.IMAGE_BANNER).setFooter(`${status} | ${repeat} | ${volume}`).setColor(client.element.COLOR_WHITE)
            dashboardButtons.addComponents(new Discord.MessageButton().setStyle(`SECONDARY`).setCustomId(`PlayPause()`).setEmoji(client.element.EMOJI_PLAY_PAUSE), new Discord.MessageButton().setEmoji(client.element.EMOJI_STOP).setStyle(`SECONDARY`).setCustomId(`Stop()`), new Discord.MessageButton().setEmoji(client.element.EMOJI_NEXT).setStyle(`SECONDARY`).setCustomId(`Skip()`), new Discord.MessageButton().setEmoji(client.element.EMOJI_REPEAT).setStyle(`SECONDARY`).setCustomId(`Repeat()`), new Discord.MessageButton().setEmoji(client.element.EMOJI_VOLUME).setStyle(`SECONDARY`).setCustomId(`Volume()`))
            channel?.messages.fetch(settings.dashboardMessage1).catch(error => {}).then(dashboard => { dashboard?.edit({ content: `**__${lang.DASHBOARD_QUEUE}__** ${queueList}`, embeds: [dashbaordEmbed], components: [dashboardButtons] }).catch(error => {}) })
        } else {
            dashbaordEmbed.setTitle(`${lang.DASHBOARD_SONG_NO_CURRENT_PLAYING}`).setImage(client.element.IMAGE_BANNER).setColor(client.element.COLOR_FLOPY)
            dashboardButtons.addComponents(new Discord.MessageButton().setEmoji(client.element.EMOJI_PLAY_PAUSE).setStyle(`SECONDARY`).setCustomId(`PlayPause()`).setDisabled(), new Discord.MessageButton().setEmoji(client.element.EMOJI_STOP).setStyle(`SECONDARY`).setCustomId(`Stop()`).setDisabled(), new Discord.MessageButton().setEmoji(client.element.EMOJI_NEXT).setStyle(`SECONDARY`).setCustomId(`Skip()`).setDisabled(), new Discord.MessageButton().setEmoji(client.element.EMOJI_REPEAT).setStyle(`SECONDARY`).setCustomId(`Repeat()`).setDisabled(), new Discord.MessageButton().setEmoji(client.element.EMOJI_VOLUME).setStyle(`SECONDARY`).setCustomId(`Volume()`).setDisabled())
            channel?.messages.fetch(settings.dashboardMessage1).catch(error => {}).then(dashboard => { dashboard?.edit({ content: `**__${lang.DASHBOARD_QUEUE}__**\n${lang.DASHBOARD_QUEUE_DEFAULT}`, embeds: [dashbaordEmbed], components: [dashboardButtons] }).catch(error => {}) })
        }
    }

    // Send commands
    client.sendCommands = async (lang, channel) => {
        const commandsEmbed = new Discord.MessageEmbed().setTitle(`${lang.COMMAND_TITLE}`).setDescription(`**${client.config.PREFIX}mix** ${lang.COMMAND_MIX}\n**${client.config.PREFIX}info** ${lang.COMMAND_INFO}\n**${client.config.PREFIX}autoplay** ${lang.COMMAND_AUTOPLAY}\n**${client.config.PREFIX}fav** ${lang.COMMAND_FAVORITE}`).setColor(client.element.COLOR_FLOPY)
        channel?.send({ embeds: [commandsEmbed] }).catch(error => {}).then(m => setTimeout(() => { m?.delete().catch(error => {}) }, 8000))
    }

    // Play song
    client.songPlay = async (lang, message) => {
        message.channel?.sendTyping().catch(error => {})
        try { client.distube.play(message, message.content).catch(error => {}) } catch(error) { client.sendError(message.channel, `${lang.ERROR_OCCURED}`) }
    }

    // Play favorites song
    client.songPlayFavorites = async (lang, message, favorites) => {
        message.channel?.sendTyping().catch(error => {})
        try { client.distube.playCustomPlaylist(message, favorites).catch(error => {}) } catch { client.sendError(message.channel, `${lang.ERROR_OCCURED}`) }
    }

    // PlayPause song
    client.songPlayPause = async (queue, settings, lang, channel) => {
        if(!queue?.paused) client.distube.pause(queue)
        else client.distube.resume(queue)
        client.updateDashboard(queue, settings, lang, channel)
    }

    // Pause song
    client.songPause = async (queue, settings, lang, channel) => {
        if(!queue?.paused) {
            client.distube.pause(queue)
            client.updateDashboard(queue, settings, lang, channel)
        }
    }

    // Stop song
    client.songStop = async (queue) => {
        client.distube.stop(queue).catch(error => {})
    }

    // Skip song
    client.songSkip = async (queue) => {
        client.distube.skip(queue).catch(error => {})
    }

    // Repeat song
    client.songRepeat = async (queue, settings, lang, channel) => {
        const repeatMode = queue?.repeatMode
        client.distube.setRepeatMode(queue, repeatMode === 0 ? 1 : repeatMode === 1 ? 2 : 0)
        client.updateDashboard(queue, settings, lang, channel)
    }

    // Volume song
    client.songVolume = async (queue, settings, lang, channel) => {
        const volume = queue?.volume
        client.distube.setVolume(queue, volume === 50 ? 25 : volume === 25 ? 75 : volume === 75 ? 100 : 50)
        client.updateDashboard(queue, settings, lang, channel)
    }

    // Autoplay song
    client.songAutoplay = async (queue, lang, channel) => {
        const autoplay = client.distube.toggleAutoplay(queue)
        client.sendCorrect(channel, `${autoplay ? lang.SONG_AUTOPLAY_ENABLED : lang.SONG_AUTOPLAY_DISABLED}`)
    }

    // Mix queue
    client.songMix = async (guild, queue, settings, lang, channel) => {
        await client.distube.shuffle(queue).catch(error => {})
        const newQueue = client.distube.getQueue(guild)
        client.updateDashboard(newQueue, settings, lang, channel)
        client.sendCorrect(channel, `${lang.SONG_QUEUE_MIXED}`)
    }

    // Info song
    client.songInfo = async (queue, lang, channel) => {
        const song = queue?.songs[0]
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
        const infoEmbed = new Discord.MessageEmbed().setTitle(`${song?.name}`).setURL(song?.url).setThumbnail(song?.thumbnail || client.element.IMAGE_BANNER).addFields({ name: `**${lang.SONG_AUTHOR}**`, value: `${song?.uploader?.name || "?"}`, inline: true }, { name: `**${lang.SONG_VIEWS}**`, value: `${song?.views || "?"}`, inline: true }, { name: `**${lang.SONG_LIKES}**`, value: `${song?.likes || "?"}`, inline: true }, { name: `**${lang.SONG_DURATION}**`, value: `${bar}` }).setColor(client.element.COLOR_FLOPY)
        channel?.send({ embeds: [infoEmbed] }).catch(error => {}).then(m => setTimeout(() => { m?.delete().catch(error => {}) }, 8000))
    }

    // Favorites song
    client.songFavorites = async (user, lang, channel, songURL) => {
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

}