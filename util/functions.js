const Discord = require("discord.js")
const mongoose = require("mongoose")
const { Guild, User } = require("../models/index")

module.exports = client => {
    // Create guild in the database
    client.createGuild = async guild => {
        const newGuild = { guildID: guild.id }
        const merged = Object.assign({ _id: mongoose.Types.ObjectId() }, newGuild)
        const createGuild = await new Guild(merged)
        createGuild.save().then(g => console.log("[+] New server".blue))
    }

    // Get guild in the database
    client.getGuild = async guild => {
        const data = await Guild.findOne({ guildID: guild.id })
        if(data) return data
        else return Object.assign(client.config.GUILD_DEFAULTSETTINGS, { "null": true })
    }

    // Update guild in the database
    client.updateGuild = async (guild, settings) => {
        let data = await client.getGuild(guild)
        if(typeof data !== "object") data = {}
        for(const key in settings) {
            if(data[key] !== settings[key]) data[key] = settings[key]
        }
        return data.updateOne(settings)
    }

    // Create user in the database
    client.createUser = async user => {
        const newUser = { userID: user.id }
        const merged = Object.assign({ _id: mongoose.Types.ObjectId() }, newUser)
        const createUser = await new User(merged)
        createUser.save().then(g => console.log("[+] New user".blue))
    }

    // Get user in the database
    client.getUser = async user => {
        const data = await User.findOne({ userID: user.id })
        if(data) return data
        else return Object.assign(client.config.USER_DEFAULTSETTINGS, { "null": true })
    }

    // Update user in the database
    client.updateUser = async (user, settings) => {
        let data = await client.getUser(user)
        if(typeof data !== "object") data = {}
        for(const key in settings) {
            if(data[key] !== settings[key]) data[key] = settings[key]
        }
        return data.updateOne(settings)
    }

    // Cooldown
    client.cooldown = (id, time) => {
    	if(client.cache["cooldown" + id]) return true
        else {
            client.cache["cooldown" + id] = true
            setTimeout(() => delete client.cache["cooldown" + id], time)
            return false
        }
    }

    // Check voice
    client.checkVoice = (guild, member) => {
        const voice = guild.me.voice.channel || false
        if(voice === member.voice.channel) return true
        else return false
    }

    // Leave voice
    client.leaveVoice = guild => {
        client.cooldown("joinVoice" + guild.id, 2000)
        client.distube.voices.leave(guild)
    }

    // Check manager
    client.checkManager = member => {
        if(member.permissions.has("MANAGE_GUILD")) return true
        else return false
    }

    // Send message
    client.sendMessage = (channel, content) => {
        const messageEmbed = new Discord.MessageEmbed().setTitle(`${content}`).setColor(client.elements.COLOR_FLOPY)
        channel.send({ embeds: [messageEmbed] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 5000))
    }

    // Send first message
    client.sendFirstMessage = guild => {
        const channel = guild.channels.cache.filter(item => item.type === "GUILD_TEXT" && item.viewable && item.permissionsFor(guild.me).has("SEND_MESSAGES")).first()
        const firstEmbed = new Discord.MessageEmbed().setTitle("Get ready to listen to music with style!").setDescription("Thank you for inviting me to your server.\nTo start listening to music, mention me in a channel.").setImage(client.elements.BANNER_FLOPY).setColor(client.elements.COLOR_FLOPY)
        if(channel) channel.send({ embeds: [firstEmbed] }).catch(error => {})
    }

    // Send update message
    client.sendUpdateMessage = (guild, lang) => {
        const channel = client.cache["dashboard" + guild.id]?.channel
        const updateEmbed = new Discord.MessageEmbed().setAuthor({ name: `${lang.UPDATE_TITLE}`, iconURL: client.elements.ICON_FLOPY }).setDescription(lang.UPDATE_DESCRIPTION).setImage(client.elements.BANNER_FLOPY).setColor(client.elements.COLOR_FLOPY)
        const hideButton = new Discord.MessageActionRow().addComponents({ type: "BUTTON", customId: "Hide", style: "SECONDARY", emoji: client.elements.EMOJI_UPDATE })
        channel.send({ embeds: [updateEmbed], components: [hideButton] }).catch(error => {})
    }

    // Send error
    client.sendError = (channel, content) => {
        const errorEmbed = new Discord.MessageEmbed().setTitle(`${content}`).setColor(client.elements.COLOR_GREY)
        channel.send({ embeds: [errorEmbed] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 5000))
    }

    // Reply error
    client.replyError = (interaction, content) => {
        const errorEmbed = new Discord.MessageEmbed().setTitle(`${content}`).setColor(client.elements.COLOR_GREY)
        interaction.reply({ embeds: [errorEmbed], ephemeral: true })
    }

    // Setup dashboard
    client.setupDashboard = async (guild, channel, settings) => {
        const setupEmbed = new Discord.MessageEmbed().setTitle("Language selection").setImage(client.elements.BANNER_PRIMARY).setColor(client.elements.COLOR_FLOPY)
        const setupButtons = new Discord.MessageActionRow().addComponents({ type: "BUTTON", customId: "LangEn", style: "SECONDARY", emoji: { id: client.elements.EMOJI_LANG_EN } }, { type: "BUTTON", customId: "LangFr", style: "SECONDARY", emoji: { id: client.elements.EMOJI_LANG_FR } })
        await client.cache["dashboard" + guild.id]?.delete().catch(error => {})
        channel.send({ embeds: [setupEmbed] }).catch(error => {}).then(async message => {
            if(message) {
                await client.updateGuild(guild, { flopy1: Object.assign(settings.flopy1, { "channel": channel.id, "message": message.id }) })
                client.cache["dashboard" + guild.id] = message
                message.edit({ components: [setupButtons] }).catch(error => {})
            }
        })
    }

    // Get dashboard
    client.getDashboard = async (guild, settings) => {
        const channel = guild.channels.cache.get(settings.flopy1.channel)
        let found = false
        if(channel) {
            await channel.messages.fetch(settings.flopy1.message).catch(error => {}).then(message => {
                if(message) {
                    client.cache["dashboard" + guild.id] = message
                    found = true
                }
            })
        }
        return found
    }

    // Update dashboard
    client.updateDashboard = (guild, queue, lang) => {
        if(queue) {
            const song = queue.songs[0]
            const songs = queue.songs.slice(1, client.config.QUEUE_MAX_DISPLAY + 1).map((item, i) => { return `${i + 1}. ${item.name.length <= client.config.SONG_MAX_LENGTH ? item.name : item.name.substring(0, client.config.SONG_MAX_LENGTH) + "..."}` }).reverse().join("\n")
            const dashboardEmbed = new Discord.MessageEmbed().setTitle(`[${song.formattedDuration}] ${song.name}`).setImage(song.thumbnail || client.elements.BANNER_SECONDARY).setFooter({ text: `${lang.DASHBOARD_REPEAT} ${queue.repeatMode === 0 ? lang.DASHBOARD_REPEAT_OFF : queue.repeatMode === 1 ? lang.DASHBOARD_REPEAT_SONG : lang.DASHBOARD_REPEAT_QUEUE} | ${lang.DASHBOARD_VOLUME} ${queue.volume}%`, iconURL: song.member.displayAvatarURL() || song.member.user.displayAvatarURL() }).setColor(client.elements.COLOR_WHITE)
            const dashboardButtons = new Discord.MessageActionRow().addComponents({ type: "BUTTON", customId: "Play", style: "SECONDARY", emoji: { id: queue.playing ? client.elements.EMOJI_PAUSE : client.elements.EMOJI_PLAY } }, { type: "BUTTON", customId: "Stop", style: "SECONDARY", emoji: { id: client.elements.EMOJI_STOP } }, { type: "BUTTON", customId: "Skip", style: "SECONDARY", emoji: { id: client.elements.EMOJI_SKIP } }, { type: "BUTTON", customId: "Repeat", style: "SECONDARY", emoji: { id: client.elements.EMOJI_REPEAT } }, { type: "BUTTON", customId: "Volume", style: "SECONDARY", emoji: { id: client.elements.EMOJI_VOLUME } })
            client.cache["dashboard" + guild.id]?.edit({ content: `**__${lang.DASHBOARD_QUEUE}__**\n${queue.songs.length - 1 > client.config.QUEUE_MAX_DISPLAY ? `**+${queue.songs.length - 1 - client.config.QUEUE_MAX_DISPLAY}**\n` : ""}${songs || lang.DASHBOARD_QUEUE_NO_SONG}`, embeds: [dashboardEmbed], components: [dashboardButtons] }).catch(error => {})
        } else {
            const dashboardEmbed = new Discord.MessageEmbed().setTitle(`${lang.DASHBOARD_SONG_NO_PLAYING}`).setDescription(`[Flopy](${client.config.INVITE_FLOPY}) | [Flopy 2](${client.config.INVITE_FLOPY2}) | [Flopy 3](${client.config.INVITE_FLOPY3})`).setImage(client.elements.BANNER_PRIMARY).setFooter({ text: `${lang.DASHBOARD_HELP_COMMAND} ${client.config.PREFIX}help` }).setColor(client.elements.COLOR_FLOPY)
            const dashboardButtons = new Discord.MessageActionRow().addComponents({ type: "BUTTON", customId: "Play", style: "SECONDARY", emoji: { id: client.elements.EMOJI_PLAY }, disabled: true }, { type: "BUTTON", customId: "Stop", style: "SECONDARY", emoji: { id: client.elements.EMOJI_STOP }, disabled: true }, { type: "BUTTON", customId: "Skip", style: "SECONDARY", emoji: { id: client.elements.EMOJI_SKIP }, disabled: true }, { type: "BUTTON", customId: "Repeat", style: "SECONDARY", emoji: { id: client.elements.EMOJI_REPEAT }, disabled: true }, { type: "BUTTON", customId: "Volume", style: "SECONDARY", emoji: { id: client.elements.EMOJI_VOLUME }, disabled: true })
            client.cache["dashboard" + guild.id]?.edit({ content: `**__${lang.DASHBOARD_QUEUE}__**\n${lang.DASHBOARD_QUEUE_NONE}`, embeds: [dashboardEmbed], components: [dashboardButtons] }).catch(error => {})
        }
    }

    // Refresh dashboard
    client.refreshDashboard = async (guild, settings, queue, lang) => {
        const channel = client.cache["dashboard" + guild.id]?.channel
        const newEmbed = new Discord.MessageEmbed().setTitle("ㅤ").setColor(client.elements.COLOR_FLOPY)
        client.cooldown("leaveVoice" + guild.id, 2000)
        await client.cache["dashboard" + guild.id]?.delete().catch(error => {})
        channel.send({ embeds: [newEmbed] }).catch(error => {}).then(async message => {
            if(message) {
                await client.updateGuild(guild, { flopy1: Object.assign(settings.flopy1, { "channel": channel.id, "message": message.id }) })
                client.cache["dashboard" + guild.id] = message
                client.updateDashboard(guild, queue, lang)
            } else client.leaveVoice(guild)
        })
    }

    // Create bar
    client.createBar = queue => {
        const song = queue.songs[0]
        let percentage = ((queue.currentTime / song.duration) * 100).toFixed(0)
        let bar = ""
        for(i = 0; i < 20; i++) {
            if(percentage >= 5) {
                percentage -= 5
                bar += client.elements.SYMBOL_LINE
            } else if(percentage !== null) {
                percentage = null
                bar += client.elements.SYMBOL_CIRCLE
            } else bar += " "
        }
        return `\`${queue.formattedCurrentTime} ${bar} ${song.formattedDuration}\``
    }

    // Convert time
    client.convertTime = time => {
        let sec = 0
        sec = sec + Number(time[time.length - 1] || 0)
        sec = sec + Number(time[time.length - 2] || 0) * 10
        sec = sec + Number(time[time.length - 3] || 0) * 60
        sec = sec + Number(time[time.length - 4] || 0) * 60 * 10
        sec = sec + Number(time[time.length - 5] || 0) * 60 * 60
        sec = sec + Number(time[time.length - 6] || 0) * 60 * 60 * 10
        return sec
    }

    // Help
    client.help = (channel, lang, command) => {
        if(!command) {
            const commands = client.commands.filter(item => item.data.type === "command" && item.data.name !== "help").map((item, i) => { return `\`${item.data.name}\`` }).join(", ")
            const filters = client.commands.filter(item => item.data.type === "filter").map((item, i) => { return `\`${item.data.name}\`` }).join(", ")
            const helpEmbed = new Discord.MessageEmbed().setAuthor({ name: "Help", iconURL: client.elements.ICON_FLOPY }).addFields({ name: `**${lang.HELP_COMMANDS}**`, value: `${commands}` }, { name: `**${lang.HELP_FILTERS}**`, value: `${filters}` }).setFooter({ text: `${lang.HELP_DETAILS} ${client.config.PREFIX}help <command>` }).setColor(client.elements.COLOR_FLOPY)
            channel.send({ embeds: [helpEmbed] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 10000))
        } else {
            const commandEmbed = new Discord.MessageEmbed().setAuthor({ name: `Help: ${command.data.name}`, iconURL: client.elements.ICON_FLOPY }).addFields({ name: `**${lang.HELP_DESCRIPTION}**`, value: `${eval("lang." + command.data.description)}` }, { name: `**${lang.HELP_USAGE}**`, value: `\`${client.config.PREFIX}${command.data.name}${command.data.usage}\`` }).setColor(client.elements.COLOR_FLOPY)
            channel.send({ embeds: [commandEmbed] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 8000))
        }
    }
}