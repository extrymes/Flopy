const Discord = require("discord.js")
const mongoose = require("mongoose")
const { Guild } = require("../models/index")
const { User } = require("../models/index")
const { RepeatMode } = require('discord-music-player')

const cooldown = {}
const queue = {}

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
    client.updateDashboard = async (guild, settings, lang, channel) => {
        const music = queue[guild.id]?.nowPlaying
        const dashbaordEmbed = new Discord.MessageEmbed()
        const dashboardButtons = new Discord.MessageActionRow()
        if(music) {
            const queueCount = queue[guild.id]?.songs?.length - 1
            let queueList = `\n${lang.DASHBOARD_QUEUE_NO_MUSIC}`
            if(queueCount > 0) {
                queueList = ""
                for(i = 1; i <= Math.min(queueCount, client.config.QUEUE_DISPLAY_MAX); i++) { queueList = `\n${i}. ${queue[guild.id]?.songs[i]?.name}` + queueList }
                if(queueCount > client.config.QUEUE_DISPLAY_MAX) queueList = `\n**+${queueCount - client.config.QUEUE_DISPLAY_MAX} ${lang.DASHBOARD_QUEUE_MORE}**` + queueList
            }
            const status = queue[guild.id]?.connection?.paused?.toString().replace("false", `${lang.DASHBOARD_MUSIC_CURRENT_PLAYING}`).replace("true", `${lang.DASHBOARD_MUSIC_CURRENT_PAUSED}`)
            const repeat = `${lang.DASHBOARD_REPEAT} ${queue[guild.id]?.repeatMode.toString().replace("0", `${lang.DASHBOARD_REPEAT_OFF}`).replace("1", `${lang.DASHBOARD_REPEAT_MUSIC}`).replace("2", `${lang.DASHBOARD_REPEAT_QUEUE}`)}`
            const volume = `${lang.DASHBOARD_VOLUME} ${queue[guild.id]?.volume}%`
            dashbaordEmbed.setTitle(`[${music?.duration}] ${music?.name}`).setImage(music?.thumbnail || client.element.IMAGE_BANNER).setFooter(`${status} | ${repeat} | ${volume}`).setColor(client.element.COLOR_WHITE)
            dashboardButtons.addComponents(new Discord.MessageButton().setStyle(`SECONDARY`).setCustomId(`PlayPause()`).setEmoji(client.element.EMOJI_PLAY_PAUSE), new Discord.MessageButton().setEmoji(client.element.EMOJI_STOP).setStyle(`SECONDARY`).setCustomId(`Stop()`), new Discord.MessageButton().setEmoji(client.element.EMOJI_NEXT).setStyle(`SECONDARY`).setCustomId(`Skip()`), new Discord.MessageButton().setEmoji(client.element.EMOJI_REPEAT).setStyle(`SECONDARY`).setCustomId(`Repeat()`), new Discord.MessageButton().setEmoji(client.element.EMOJI_VOLUME).setStyle(`SECONDARY`).setCustomId(`Volume()`))
            channel?.messages.fetch(settings.dashboardMessage1).catch(error => {}).then(dashboard => { dashboard?.edit({ content: `**__${lang.DASHBOARD_QUEUE}__** ${queueList}`, embeds: [dashbaordEmbed], components: [dashboardButtons] }).catch(error => {}) })
        } else {
            dashbaordEmbed.setTitle(`${lang.DASHBOARD_MUSIC_NO_CURRENT_PLAYING}`).setImage(client.element.IMAGE_BANNER).setColor(client.element.COLOR_FLOPY)
            dashboardButtons.addComponents(new Discord.MessageButton().setEmoji(client.element.EMOJI_PLAY_PAUSE).setStyle(`SECONDARY`).setCustomId(`PlayPause()`).setDisabled(), new Discord.MessageButton().setEmoji(client.element.EMOJI_STOP).setStyle(`SECONDARY`).setCustomId(`Stop()`).setDisabled(), new Discord.MessageButton().setEmoji(client.element.EMOJI_NEXT).setStyle(`SECONDARY`).setCustomId(`Skip()`).setDisabled(), new Discord.MessageButton().setEmoji(client.element.EMOJI_REPEAT).setStyle(`SECONDARY`).setCustomId(`Repeat()`).setDisabled(), new Discord.MessageButton().setEmoji(client.element.EMOJI_VOLUME).setStyle(`SECONDARY`).setCustomId(`Volume()`).setDisabled())
            channel?.messages.fetch(settings.dashboardMessage1).catch(error => {}).then(dashboard => { dashboard?.edit({ content: `**__${lang.DASHBOARD_QUEUE}__**\n${lang.DASHBOARD_QUEUE_DEFAULT}`, embeds: [dashbaordEmbed], components: [dashboardButtons] }).catch(error => {}) })
        }
    }

    // Send commands
    client.sendCommands = async (lang, channel) => {
        const commandsEmbed = new Discord.MessageEmbed().setTitle(`${lang.COMMAND_TITLE}`).setDescription(`**${client.config.PREFIX}mix** ${lang.COMMAND_MIX}\n**${client.config.PREFIX}clear** ${lang.COMMAND_CLEAR}\n**${client.config.PREFIX}info** ${lang.COMMAND_INFO}\n**${client.config.PREFIX}fav** ${lang.COMMAND_FAVORITE}`).setColor(client.element.COLOR_FLOPY)
        channel?.send({ embeds: [commandsEmbed] }).catch(error => {}).then(m => setTimeout(() => { m?.delete().catch(error => {}) }, 8000))
    }

    // Play music
    client.musicPlay = async (guild, lang, channel, voice, music) => {
        channel?.sendTyping().catch(error => {})
        try {
            if(!queue[guild.id]) {
                queue[guild.id] = client.player.createQueue(guild.id)
                await queue[guild.id]?.join(voice)
            }
            queue[guild.id]?.play(music).catch(error => {
                queue[guild.id]?.playlist(music).catch(error => {
                    client.sendError(channel, `${lang.MUSIC_NO_FOUND}`)
                })
            })
        } catch {}
    }

    // PlayPause Music
    client.musicPlayPause = async (guild, settings, lang, channel) => {
        if(!queue[guild.id]?.connection?.paused) try { queue[guild.id]?.setPaused(true) } catch {}
        else try { queue[guild.id]?.setPaused(false) } catch {}
        client.updateDashboard(guild, settings, lang, channel)
    }

    // Stop music
    client.musicStop = async (guild, settings, lang, channel) => {
        try { queue[guild.id]?.stop() } catch {}
        queue[guild.id] = undefined
        client.updateDashboard(guild, settings, lang, channel)
    }

    // Skip music
    client.musicSkip = async guild => {
        try { queue[guild.id]?.setPaused(false) } catch {}
        try { queue[guild.id]?.skip() } catch {}
    }

    // Repeat music
    client.musicRepeat = async (guild, settings, lang, channel) => {
        const repeatMode = queue[guild.id]?.repeatMode
        if(repeatMode === 0) try { queue[guild.id]?.setRepeatMode(RepeatMode.SONG) } catch {}
        else if(repeatMode === 1) try { queue[guild.id]?.setRepeatMode(RepeatMode.QUEUE) } catch {}
        else try { queue[guild.id]?.setRepeatMode(RepeatMode.DISABLED) } catch {}
        client.updateDashboard(guild, settings, lang, channel)
    }

    // Volume music
    client.musicVolume = async (guild, settings, lang, channel) => {
        const volume = queue[guild.id]?.volume
        if(volume === 100) try { queue[guild.id]?.setVolume(50) } catch {}
        else if(volume === 50) try { queue[guild.id]?.setVolume(150) } catch {}
        else if(volume === 150) try { queue[guild.id]?.setVolume(200) } catch {}
        else try { queue[guild.id]?.setVolume(100) } catch {}
        client.updateDashboard(guild, settings, lang, channel)
    }

    // Mix queue
    client.musicMix = async (guild, settings, lang, channel) => {
        try { queue[guild.id]?.shuffle() } catch {}
        client.updateDashboard(guild, settings, lang, channel)
        client.sendCorrect(channel, `${lang.MUSIC_QUEUE_MIXED}`)
    }

    // Clear queue
    client.musicClear = async (guild, settings, lang, channel) => {
        try { queue[guild.id]?.clearQueue() } catch {}
        client.updateDashboard(guild, settings, lang, channel)
        client.sendCorrect(channel, `${lang.MUSIC_QUEUE_CLEARED}`)
    }

    // Info music
    client.musicInfo = async (guild, lang, channel) => {
        const music = queue[guild.id]?.nowPlaying
        const progress = queue[guild.id]?.createProgressBar({ block: "▬", arrow: "⬤" })
        const infoEmbed = new Discord.MessageEmbed().setTitle(`${music?.name}`).setURL(music?.url).setThumbnail(music?.thumbnail || client.element.IMAGE_BANNER).addFields({ name: `${lang.MUSIC_AUTHOR}`, value: `${music?.author}` }, { name: `${lang.MUSIC_DURATION}`, value: `\`${progress.prettier}\`` }).setColor(client.element.COLOR_FLOPY)
        channel?.send({ embeds: [infoEmbed] }).catch(error => {}).then(m => setTimeout(() => { m?.delete().catch(error => {}) }, 5000))
    }

    // Favorite music
    client.musicFavorite = async (user, lang, channel, music) => {
        const userData = await client.getUser(user)
        if(!userData) {
            await client.createUser(user)
            setTimeout(() => { client.updateUser(user, { favorite: music }) }, 500)
            client.sendCorrect(channel, `${lang.MUSIC_FAVORITE_DEFINED}`)
        } else {
            if(userData.favorite !== music) {
                await client.updateUser(user, { favorite: music })
                client.sendCorrect(channel, `${lang.MUSIC_FAVORITE_DEFINED}`)
            } else {
                await client.deleteUser(user)
                client.sendCorrect(channel, `${lang.MUSIC_FAVORITE_REMOVED}`)
            }
        }
    }

}