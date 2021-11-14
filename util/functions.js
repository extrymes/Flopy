const Discord = require("discord.js")
const mongoose = require("mongoose")
const { Guild } = require("../models/index")
const { User } = require("../models/index")
const { RepeatMode } = require('discord-music-player')

const cooldown = {}
const queue = {}
const loadFavorite = {}

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

    // Delete guild in the database
    client.deleteGuild = async guild => {
        await Guild.deleteOne({ guildID: guild.id }).then(console.log(`[~] Old server`.blue))
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
    client.sendGreen = async (channel, content) => {
        const greenEmbed = new Discord.MessageEmbed().setTitle(content).setColor(client.element.COLOR_GREEN)
        channel?.send({ embeds: [greenEmbed] }).catch(error => {}).then(m => setTimeout(() => { m?.delete().catch(error => {}) }, 5000))
    }

    // Send error
    client.sendRed = async (channel, content) => {
        const redEmbed = new Discord.MessageEmbed().setTitle(content).setColor(client.element.COLOR_RED)
        channel?.send({ embeds: [redEmbed] }).catch(error => {}).then(m => setTimeout(() => { m?.delete().catch(error => {}) }, 5000))
    }

    // Reply correct
    client.replyGreen = async (interaction, content) => {
        const greenEmbed = new Discord.MessageEmbed().setTitle(content).setColor(client.element.COLOR_GREEN)
        interaction?.reply({ embeds: [greenEmbed], ephemeral: true }).catch(error => {})
    }

    // Reply error
    client.replyRed = async (interaction, content) => {
        const redEmbed = new Discord.MessageEmbed().setTitle(content).setColor(client.element.COLOR_RED)
        interaction?.reply({ embeds: [redEmbed], ephemeral: true }).catch(error => {})
    }

    // Setup the dashboard
    client.setupDashboard = async (guild, channel) => {
        const settings = await client.getGuild(guild)
        const lang = require(`../util/lang/${settings.language}`)
        const loadingEmbed = new Discord.MessageEmbed().setTitle(`${client.element.EMOJI_LOADING} ${lang.LOADING}`)
        const oldChannel = guild.channels.cache.find(ch => ch.id === settings.dashboardChannel)
        await oldChannel?.messages.fetch(settings.dashboardMessage).catch(error => {}).then(async oldDashboard => await oldDashboard?.delete().catch(error => {}))
        channel?.send({ embeds: [loadingEmbed] }).catch(error => {}).then(async loading => {
            await client.updateGuild(guild, { dashboardChannel: channel.id, dashboardMessage: loading.id })
            client.setupLang(guild, loading)
        })
    }

    // Setup language
    client.setupLang = async (guild, dashboard) => {
        const settings = await client.getGuild(guild)
        const lang = require(`../util/lang/${settings.language}`)
        const langEmbed = new Discord.MessageEmbed().setTitle(`${client.element.EMOJI_LANG} ${lang.SETUP_LANG}`)
        const langButtons = new Discord.MessageActionRow().addComponents(new Discord.MessageButton().setLabel(lang.SETUP_LANG_EN).setStyle(`SECONDARY`).setCustomId(`Lang("en")`).setEmoji(client.element.EMOJI_LANG_EN), new Discord.MessageButton().setLabel(lang.SETUP_LANG_FR).setStyle(`SECONDARY`).setCustomId(`Lang("fr")`).setEmoji(client.element.EMOJI_LANG_FR))
        dashboard?.edit({ embeds: [langEmbed], components: [langButtons] }).catch(error => {})
    }

    // Update the dashboard
    client.updateDashboard = async (guild, dashboard) => {
        const settings = await client.getGuild(guild)
        const lang = require(`../util/lang/${settings.language}`)
        const song = queue[guild.id]?.nowPlaying
        const dashbaordEmbed = new Discord.MessageEmbed()
        const dashboardButtons = new Discord.MessageActionRow()
        if(song) {
            const queueArray = queue[guild.id]?.songs
            const queueCount = queueArray.length - 1
            const status = queue[guild.id]?.connection?.paused?.toString().replace("false", lang.DASHBOARD_MUSIC_CURRENT_PLAYING).replace("true", lang.DASHBOARD_MUSIC_CURRENT_PAUSED)
            const loopMode = queue[guild.id]?.repeatMode.toString().replace("0", lang.DASHBOARD_LOOP_MODE_OFF).replace("1", lang.DASHBOARD_LOOP_MODE_MUSIC).replace("2", lang.DASHBOARD_LOOP_MODE_QUEUE)
            let queueList = `\n${lang.DASHBOARD_NO_MUSIC_IN_THE_QUEUE}`
            if(queueCount > 50) queueList = `\n${queueCount} ${lang.DASHBOARD_MANY_MUSIC_IN_THE_QUEUE}`
            else if(queueCount > 0) {
                queueList = ""
                queueArray.filter(item => item !== song).forEach(function(item, index) {
                    index = index + 1
                    queueList = `\n${index}. ${item.name}` + queueList
                })
            }
            dashbaordEmbed.setTitle(`[${song.duration}] ${song.name}`).setImage(song.thumbnail || client.element.BANNER).setFooter(`${status} | ${lang.DASHBOARD_LOOP_MODE} ${loopMode}`).setColor(client.element.COLOR_WHITE)
            dashboardButtons.addComponents(new Discord.MessageButton().setLabel(lang.DASHBOARD_PLAY_PAUSE).setStyle(`SECONDARY`).setCustomId(`PlayPause()`).setEmoji(client.element.EMOJI_PLAY_PAUSE), new Discord.MessageButton().setLabel(lang.DASHBOARD_STOP).setEmoji(client.element.EMOJI_STOP).setStyle(`SECONDARY`).setCustomId(`Stop()`), new Discord.MessageButton().setLabel(lang.DASHBOARD_NEXT).setEmoji(client.element.EMOJI_NEXT).setStyle(`SECONDARY`).setCustomId(`Next()`), new Discord.MessageButton().setLabel(lang.DASHBOARD_LOOP).setEmoji(client.element.EMOJI_LOOP).setStyle(`SECONDARY`).setCustomId(`Loop()`), new Discord.MessageButton().setLabel(lang.DASHBOARD_FAVORITE).setEmoji(client.element.EMOJI_FAVORITE).setStyle(`SECONDARY`).setCustomId(`Favorite()`))
            dashboard?.edit({ content: `**__${lang.DASHBOARD_QUEUE}__** ${queueList}`, embeds: [dashbaordEmbed], components: [dashboardButtons] }).catch(error => {})
        } else {
            dashbaordEmbed.setTitle(lang.DASHBOARD_NO_MUSIC_CURRENT_PLAYING).setImage(client.element.BANNER).setColor(client.element.COLOR_FLOPY)
            dashboardButtons.addComponents(new Discord.MessageButton().setLabel(lang.DASHBOARD_PLAY_PAUSE).setEmoji(client.element.EMOJI_PLAY_PAUSE).setStyle(`SECONDARY`).setCustomId(`PlayPause()`).setDisabled(), new Discord.MessageButton().setLabel(lang.DASHBOARD_STOP).setEmoji(client.element.EMOJI_STOP).setStyle(`SECONDARY`).setCustomId(`Stop()`).setDisabled(), new Discord.MessageButton().setLabel(lang.DASHBOARD_NEXT).setEmoji(client.element.EMOJI_NEXT).setStyle(`SECONDARY`).setCustomId(`Next()`).setDisabled(), new Discord.MessageButton().setLabel(lang.DASHBOARD_LOOP).setEmoji(client.element.EMOJI_LOOP).setStyle(`SECONDARY`).setCustomId(`Loop()`).setDisabled(), new Discord.MessageButton().setLabel(lang.DASHBOARD_FAVORITE).setEmoji(client.element.EMOJI_FAVORITE).setStyle(`SECONDARY`).setCustomId(`Favorite()`))
            dashboard?.edit({ content: `**__${lang.DASHBOARD_QUEUE}__**\n${lang.DASHBOARD_QUEUE_MSG}`, embeds: [dashbaordEmbed], components: [dashboardButtons] }).catch(error => {})
        }
    }

    // Play music
    client.musicPlay = async (guild, channel, music) => {
        try {
            if(!queue[guild.id]) queue[guild.id] = client.player.createQueue(guild.id)
            await queue[guild.id]?.join(channel)
            await queue[guild.id]?.play(music).catch(error => {
                if(!queue[guild.id]) {
                    queue[guild.id]?.stop()
                    queue[guild.id] = undefined
                }
            })
        } catch {}
    }

    // PlayPause Music
    client.musicPlayPause = async guild => {
        if(!queue[guild.id]?.connection?.paused) try { queue[guild.id]?.setPaused(true) } catch {}
        else try { queue[guild.id]?.setPaused(false) } catch {}
        const settings = await client.getGuild(guild)
        const dashboardChannel = guild.channels.cache.find(ch => ch.id === settings.dashboardChannel)
        dashboardChannel?.messages.fetch(settings.dashboardMessage).catch(error => {}).then(dashboard => {
            client.updateDashboard(guild, dashboard)
        })
    }

    // Stop music
    client.musicStop = async guild => {
        try { queue[guild.id]?.stop() } catch {}
        queue[guild.id] = undefined
        const settings = await client.getGuild(guild)
        const dashboardChannel = guild.channels.cache.find(ch => ch.id === settings.dashboardChannel)
        dashboardChannel?.messages.fetch(settings.dashboardMessage).catch(error => {}).then(dashboard => {
            client.updateDashboard(guild, dashboard)
        })
    }

    // Next music
    client.musicNext = async guild => {
        try { queue[guild.id]?.skip() } catch {}
        if(queue[guild.id]?.songs.length === 1) queue[guild.id] = undefined
    }

    // Loop music
    client.musicLoop = async guild => {
        const loopMode = queue[guild.id]?.repeatMode
        if(loopMode === 0) try { queue[guild.id]?.setRepeatMode(RepeatMode.SONG) } catch {}
        else if(loopMode === 1) try { queue[guild.id]?.setRepeatMode(RepeatMode.QUEUE) } catch {}
        else try { queue[guild.id]?.setRepeatMode(RepeatMode.DISABLED) } catch {}
        const settings = await client.getGuild(guild)
        const dashboardChannel = guild.channels.cache.find(ch => ch.id === settings.dashboardChannel)
        dashboardChannel?.messages.fetch(settings.dashboardMessage).catch(error => {}).then(dashboard => {
            client.updateDashboard(guild, dashboard)
        })
    }

    // Favorite music
    client.musicFavorite = async (guild, interaction, user, music) => {
        const settings = await client.getGuild(guild)
        const lang = require(`../util/lang/${settings.language}`)
        const userData = await client.getUser(user)
        if(!userData) {
            await client.createUser(user)
            setTimeout(() => { client.updateUser(user, { favorite: music }) }, 500)
            client.replyGreen(interaction, `${lang.FAVORITE_DEFINED}`)
        } else {
            if(userData.favorite !== music) {
                await client.updateUser(user, { favorite: music })
                client.replyGreen(interaction, `${lang.FAVORITE_DEFINED}`)
            } else {
                await client.deleteUser(user)
                client.replyGreen(interaction, `${lang.FAVORITE_REMOVED}`)
            }
        }
    }

}