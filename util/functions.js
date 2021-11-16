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
    client.setupDashboard = async (guild, channel) => {
        const settings = await client.getGuild(guild)
        const lang = require(`../util/lang/${settings.language}`)
        const langEmbed = new Discord.MessageEmbed().setTitle(`${client.element.EMOJI_LANG} ${lang.SETUP_LANG}`).setColor(client.element.COLOR_FLOPY)
        const langButtons = new Discord.MessageActionRow().addComponents(new Discord.MessageButton().setLabel(lang.SETUP_LANG_EN).setStyle(`SECONDARY`).setCustomId(`Lang("en")`).setEmoji(client.element.EMOJI_LANG_EN), new Discord.MessageButton().setLabel(lang.SETUP_LANG_FR).setStyle(`SECONDARY`).setCustomId(`Lang("fr")`).setEmoji(client.element.EMOJI_LANG_FR))
        const oldChannel = guild.channels.cache.find(ch => ch.id === settings.dashboardChannel)
        await oldChannel?.messages.fetch(settings.dashboardMessage).catch(error => {}).then(async oldDashboard => await oldDashboard?.delete().catch(error => {}))
        channel?.send({ embeds: [langEmbed], components: [langButtons] }).catch(error => {}).then(dashboard => { client.updateGuild(guild, { dashboardChannel: dashboard.channel.id, dashboardMessage: dashboard.id }) })
    }

    // Update the dashboard
    client.updateDashboard = async (guild) => {
        const settings = await client.getGuild(guild)
        const lang = require(`../util/lang/${settings.language}`)
        const music = queue[guild.id]?.nowPlaying
        const dashboardChannel = guild.channels.cache.find(ch => ch.id === settings.dashboardChannel)
        const dashbaordEmbed = new Discord.MessageEmbed()
        const dashboardButtons = new Discord.MessageActionRow()
        if(music) {
            const queueCount = queue[guild.id]?.songs?.length - 1
            let queueList = `\n${lang.DASHBOARD_QUEUE_NO_MUSIC}`
            if(queueCount > 0) {
                queueList = ""
                for(i = 1; i <= Math.min(queueCount, client.config.QUEUE_MAX); i++) { queueList = `\n${i}. ${queue[guild.id]?.songs[i]?.name}` + queueList }
                if(queueCount > client.config.QUEUE_MAX) queueList = `\n**+${queueCount - client.config.QUEUE_MAX} ${lang.DASHBOARD_QUEUE_MORE}**` + queueList
            }
            const status = queue[guild.id]?.connection?.paused?.toString().replace("false", `${lang.DASHBOARD_MUSIC_CURRENT_PLAYING}`).replace("true", `${lang.DASHBOARD_MUSIC_CURRENT_PAUSED}`)
            const repeat = `${lang.DASHBOARD_REPEAT} ${queue[guild.id]?.repeatMode.toString().replace("0", `${lang.DASHBOARD_REPEAT_OFF}`).replace("1", `${lang.DASHBOARD_REPEAT_MUSIC}`).replace("2", `${lang.DASHBOARD_REPEAT_QUEUE}`)}`
            const volume = `${lang.DASHBOARD_VOLUME} ${queue[guild.id]?.options?.volume}%`
            dashbaordEmbed.setTitle(`[${music?.duration}] ${music?.name}`).setImage(music?.thumbnail || client.element.BANNER).setFooter(`${status} | ${repeat} | ${volume}`).setColor(client.element.COLOR_WHITE)
            dashboardButtons.addComponents(new Discord.MessageButton().setStyle(`SECONDARY`).setCustomId(`PlayPause()`).setEmoji(client.element.EMOJI_PLAY_PAUSE), new Discord.MessageButton().setEmoji(client.element.EMOJI_STOP).setStyle(`SECONDARY`).setCustomId(`Stop()`), new Discord.MessageButton().setEmoji(client.element.EMOJI_NEXT).setStyle(`SECONDARY`).setCustomId(`Skip()`), new Discord.MessageButton().setEmoji(client.element.EMOJI_REPEAT).setStyle(`SECONDARY`).setCustomId(`Repeat()`), new Discord.MessageButton().setEmoji(client.element.EMOJI_VOLUME).setStyle(`SECONDARY`).setCustomId(`Volume()`))
            dashboardChannel?.messages.fetch(settings.dashboardMessage).catch(error => {}).then(dashboard => { dashboard?.edit({ content: `**__${lang.DASHBOARD_QUEUE}__** ${queueList}`, embeds: [dashbaordEmbed], components: [dashboardButtons] }).catch(error => {}) })
        } else {
            dashbaordEmbed.setTitle(`${lang.DASHBOARD_MUSIC_NO_CURRENT_PLAYING}`).setImage(client.element.BANNER).setColor(client.element.COLOR_FLOPY)
            dashboardButtons.addComponents(new Discord.MessageButton().setEmoji(client.element.EMOJI_PLAY_PAUSE).setStyle(`SECONDARY`).setCustomId(`PlayPause()`).setDisabled(), new Discord.MessageButton().setEmoji(client.element.EMOJI_STOP).setStyle(`SECONDARY`).setCustomId(`Stop()`).setDisabled(), new Discord.MessageButton().setEmoji(client.element.EMOJI_NEXT).setStyle(`SECONDARY`).setCustomId(`Skip()`).setDisabled(), new Discord.MessageButton().setEmoji(client.element.EMOJI_REPEAT).setStyle(`SECONDARY`).setCustomId(`Repeat()`).setDisabled(), new Discord.MessageButton().setEmoji(client.element.EMOJI_VOLUME).setStyle(`SECONDARY`).setCustomId(`Volume()`).setDisabled())
            dashboardChannel?.messages.fetch(settings.dashboardMessage).catch(error => {}).then(dashboard => { dashboard?.edit({ content: `**__${lang.DASHBOARD_QUEUE}__**\n${lang.DASHBOARD_QUEUE_DEFAULT}`, embeds: [dashbaordEmbed], components: [dashboardButtons] }).catch(error => {}) })
        }
    }

    client.sendCommands = async guild => {
        const settings = await client.getGuild(guild)
        const lang = require(`../util/lang/${settings.language}`)
        const dashboardChannel = guild.channels.cache.find(ch => ch.id === settings.dashboardChannel)
        const commandsEmbed = new Discord.MessageEmbed().setTitle(`${lang.COMMAND_TITLE}`).setDescription(`**${client.config.PREFIX}shuffle** ${lang.COMMAND_SHUFFLE}\n**${client.config.PREFIX}info** ${lang.COMMAND_INFO}\n**${client.config.PREFIX}fav** ${lang.COMMAND_FAVORITE}`).setColor(client.element.COLOR_FLOPY)
        dashboardChannel?.send({ embeds: [commandsEmbed] }).catch(error => {}).then(m => setTimeout(() => { m?.delete().catch(error => {}) }, 8000))
    }

    // Play music
    client.musicPlay = async (guild, channel, music) => {
        try {
            if(!queue[guild.id]) {
                queue[guild.id] = client.player.createQueue(guild.id)
                await queue[guild.id]?.join(channel)
            }
            queue[guild.id]?.play(music).catch(error => {
                if(!queue[guild.id]) queue[guild.id]?.stop()
            })
            queue[guild.id]?.playlist(music).catch(error => {
                if(!queue[guild.id]) queue[guild.id]?.stop()
            })
        } catch {}
    }

    // PlayPause Music
    client.musicPlayPause = async guild => {
        if(!queue[guild.id]?.connection?.paused) try { queue[guild.id]?.setPaused(true) } catch {}
        else try { queue[guild.id]?.setPaused(false) } catch {}
        client.updateDashboard(guild)
    }

    // Stop music
    client.musicStop = async guild => {
        try { queue[guild.id]?.stop() } catch {}
        queue[guild.id] = undefined
        client.updateDashboard(guild)
    }

    // Skip music
    client.musicSkip = async guild => {
        try { queue[guild.id]?.setPaused(false) } catch {}
        try { queue[guild.id]?.skip() } catch {}
    }

    // Repeat music
    client.musicRepeat = async guild => {
        const repeatMode = queue[guild.id]?.repeatMode
        if(repeatMode === 0) try { queue[guild.id]?.setRepeatMode(RepeatMode.SONG) } catch {}
        else if(repeatMode === 1) try { queue[guild.id]?.setRepeatMode(RepeatMode.QUEUE) } catch {}
        else try { queue[guild.id]?.setRepeatMode(RepeatMode.DISABLED) } catch {}
        client.updateDashboard(guild)
    }

    // Shuffle music
    client.musicShuffle = async guild => {
        try { queue[guild.id]?.shuffle() } catch {}
        client.updateDashboard(guild)
    }

    // Volume music
    client.musicVolume = async guild => {
        const volume = queue[guild.id]?.options?.volume
        if(volume === 100) try { queue[guild.id]?.setVolume(50) } catch {}
        else if(volume === 50) try { queue[guild.id]?.setVolume(150) } catch {}
        else if(volume === 150) try { queue[guild.id]?.setVolume(200) } catch {}
        else try { queue[guild.id]?.setVolume(100) } catch {}
        client.updateDashboard(guild)
    }

    // Info music
    client.musicInfo = async (guild, lang, channel) => {
        const music = queue[guild.id]?.nowPlaying
        const progress = queue[guild.id]?.createProgressBar()
        const infoEmbed = new Discord.MessageEmbed().setTitle(`${music?.name}`).setURL(music?.url).setThumbnail(music?.thumbnail || client.element.BANNER).setDescription(`**${lang.MUSIC_AUTHOR}** ${music?.author}\n**${lang.MUSIC_TIME}** ${progress?.times}`).setColor(client.element.COLOR_FLOPY)
        channel?.send({ embeds: [infoEmbed] }).catch(error => {}).then(m => setTimeout(() => { m?.delete().catch(error => {}) }, 5000))
    }

    // Favorite music
    client.musicFavorite = async (user, lang, channel, music) => {
        const userData = await client.getUser(user)
        if(!userData) {
            await client.createUser(user)
            setTimeout(() => { client.updateUser(user, { favorite: music }) }, 500)
            client.sendCorrect(channel, `${lang.USER_MUSIC_FAVORITE_DEFINED}`)
        } else {
            if(userData.favorite !== music) {
                await client.updateUser(user, { favorite: music })
                client.sendCorrect(channel, `${lang.USER_MUSIC_FAVORITE_DEFINED}`)
            } else {
                await client.deleteUser(user)
                client.sendCorrect(channel, `${lang.USER_MUSIC_FAVORITE_REMOVED}`)
            }
        }
    }

}