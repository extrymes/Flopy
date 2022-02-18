const Discord = require("discord.js")
const mongoose = require("mongoose")
const { Guild, User } = require("../models/index")
const dashboard = {}
const cooldown = {}

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
        return false
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
        return false
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

    // Delete user in the database
    client.deleteUser = async user => {
        await User.deleteOne({ userID: user.id }).then(console.log("[~] Old user".blue))
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

    // Check voice
    client.checkVoice = (guild, member) => {
        const voice = guild.me.voice.channel || false
        if(voice === member.voice.channel) return true
        else return false
    }

    // Send message
    client.sendMessage = async (channel, content) => {
        const messageEmbed = new Discord.MessageEmbed().setTitle(`${content}`).setColor(client.element.COLOR_FLOPY)
        channel?.send({ embeds: [messageEmbed] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 5000))
    }

    // Send first message
    client.sendFirstMessage = async guild => {
        const firstEmbed = new Discord.MessageEmbed().setTitle("Get ready to listen to some music!").setDescription("Thank you for adding me to your server.\nTo start listening to music, mention me in a channel.").setImage(client.element.BANNER_FLOPY).setColor(client.element.COLOR_FLOPY)
        let found = false
        guild.channels.cache.forEach(channel => {
            if(!found && channel.type === "GUILD_TEXT" && channel.viewable && channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
                found = true
                channel.send({ embeds: [firstEmbed] }).catch(error => {})
            }
        })
    }

    // Send update message
    client.sendUpdateMessage = async (guild, lang) => {
        const channel = dashboard[guild.id]?.channel
        const updateEmbed = new Discord.MessageEmbed().setAuthor({ name: `${lang.UPDATE_TITLE}`, iconURL: client.element.ICON_FLOPY }).setDescription(lang.UPDATE_DESCRIPTION).setImage(client.element.BANNER_FLOPY).setColor(client.element.COLOR_FLOPY)
        const hideButton = new Discord.MessageActionRow().addComponents({ type: "BUTTON", customId: "Hide", style: "SECONDARY", emoji: { id: client.element.EMOJI_UPDATE } })
        channel?.send({ embeds: [updateEmbed], components: [hideButton] }).catch(error => {})
    }

    // Send error
    client.sendError = async (channel, content) => {
        const errorEmbed = new Discord.MessageEmbed().setTitle(`${content}`).setColor(client.element.COLOR_GREY)
        channel?.send({ embeds: [errorEmbed] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 5000))
    }

    // Reply error
    client.replyError = async (interaction, content) => {
        const errorEmbed = new Discord.MessageEmbed().setTitle(`${content}`).setColor(client.element.COLOR_GREY)
        interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(error => {})
    }

    // Setup dashboard
    client.setupDashboard = async (guild, settings, channel) => {
        const setupEmbed = new Discord.MessageEmbed().setTitle("Language selection").setImage(client.element.BANNER_PRIMARY).setColor(client.element.COLOR_FLOPY)
        const setupButtons = new Discord.MessageActionRow().addComponents({ type: "BUTTON", customId: "LangEn", style: "SECONDARY", emoji: { id: client.element.EMOJI_LANG_EN } }, { type: "BUTTON", customId: "LangFr", style: "SECONDARY", emoji: { id: client.element.EMOJI_LANG_FR } })
        await dashboard[guild.id]?.delete().catch(error => {})
        channel.send({ embeds: [setupEmbed] }).catch(error => {}).then(async message => {
            if(message) {
                await client.updateGuild(guild, { flopy1: { channel: channel.id, message: message.id, voice: settings.flopy1.voice, language: settings.flopy1.language } })
                await client.getDashboard(guild, settings, message)
                message.edit({ components: [setupButtons] }).catch(error => {})
            }
        })
    }

    // Get dashboard
    client.getDashboard = async (guild, settings, message) => {
        if(message) dashboard[guild.id] = message
        else {
            let found = false
            const channel = guild.channels.cache.get(settings.flopy1.channel)
            if(channel) {
                await channel.messages.fetch(settings.flopy1.message).catch(error => {}).then(message => {
                    if(message) {
                        dashboard[guild.id] = message
                        found = true
                    } else client.updateGuild(guild, { flopy1: client.config.GUILD_DEFAULTSETTINGS.flopy1 })
                })
            } else client.updateGuild(guild, { flopy1: client.config.GUILD_DEFAULTSETTINGS.flopy1 })
            return found
        }
    }

    // Update dashboard
    client.updateDashboard = async (guild, lang, queue) => {
        if(queue) {
            const song = queue.songs[0]
            const songs = queue.songs.slice(1, client.config.QUEUE_MAX_DISPLAY + 1).map((item, i) => { return `${i + 1}. ${item.name.length <= client.config.SONG_MAX_LENGTH ? item.name : item.name.substring(0, client.config.SONG_MAX_LENGTH) + "..."}` }).reverse().join("\n")
            const dashboardEmbed = new Discord.MessageEmbed().setTitle(`[${song.formattedDuration}] ${song.name}`).setImage(song.thumbnail || client.element.BANNER_SECONDARY).setFooter({ text: `${lang.DASHBOARD_REPEAT} ${queue.repeatMode === 0 ? lang.DASHBOARD_REPEAT_OFF : queue.repeatMode === 1 ? lang.DASHBOARD_REPEAT_SONG : lang.DASHBOARD_REPEAT_QUEUE} | ${lang.DASHBOARD_VOLUME} ${queue.volume}%`, iconURL: song.member.displayAvatarURL() || song.member.user.displayAvatarURL() }).setColor(client.element.COLOR_WHITE)
            const dashboardButtons = new Discord.MessageActionRow().addComponents({ type: "BUTTON", customId: "Play", style: "SECONDARY", emoji: { id: queue.playing ? client.element.EMOJI_PAUSE : client.element.EMOJI_PLAY } }, { type: "BUTTON", customId: "Stop", style: "SECONDARY", emoji: { id: client.element.EMOJI_STOP } }, { type: "BUTTON", customId: "Skip", style: "SECONDARY", emoji: { id: client.element.EMOJI_SKIP } }, { type: "BUTTON", customId: "Repeat", style: "SECONDARY", emoji: { id: client.element.EMOJI_REPEAT } }, { type: "BUTTON", customId: "Volume", style: "SECONDARY", emoji: { id: client.element.EMOJI_VOLUME } })
            dashboard[guild.id]?.edit({ content: `**__${lang.DASHBOARD_QUEUE}__**\n${queue.songs.length - 1 <= client.config.QUEUE_MAX_DISPLAY ? `${songs || lang.DASHBOARD_QUEUE_NO_SONG}` : `**+${queue.songs.length - 1 - client.config.QUEUE_MAX_DISPLAY}**\n${songs}`}`, embeds: [dashboardEmbed], components: [dashboardButtons] }).catch(error => {})
        } else {
            const dashboardEmbed = new Discord.MessageEmbed().setTitle(`${lang.DASHBOARD_SONG_NO_PLAYING}`).setDescription(`[Flopy](${client.config.INVITE_FLOPY}) | [Flopy 2](${client.config.INVITE_FLOPY2}) | [Flopy 3](${client.config.INVITE_FLOPY3})`).setImage(client.element.BANNER_PRIMARY).setFooter({ text: `${lang.DASHBOARD_HELP_COMMAND} ${client.config.PREFIX}help` }).setColor(client.element.COLOR_FLOPY)
            const dashboardButtons = new Discord.MessageActionRow().addComponents({ type: "BUTTON", customId: "Play", style: "SECONDARY", emoji: { id: client.element.EMOJI_PLAY }, disabled: true }, { type: "BUTTON", customId: "Stop", style: "SECONDARY", emoji: { id: client.element.EMOJI_STOP }, disabled: true }, { type: "BUTTON", customId: "Skip", style: "SECONDARY", emoji: { id: client.element.EMOJI_SKIP }, disabled: true }, { type: "BUTTON", customId: "Repeat", style: "SECONDARY", emoji: { id: client.element.EMOJI_REPEAT }, disabled: true }, { type: "BUTTON", customId: "Volume", style: "SECONDARY", emoji: { id: client.element.EMOJI_VOLUME }, disabled: true })
            dashboard[guild.id]?.edit({ content: `**__${lang.DASHBOARD_QUEUE}__**\n${lang.DASHBOARD_QUEUE_NONE}`, embeds: [dashboardEmbed], components: [dashboardButtons] }).catch(error => {})
        }
    }

    // Create bar
    client.createBar = async queue => {
        const song = queue.songs[0]
        let percentage = ((queue.currentTime / song.duration) * 100).toFixed(0)
        let bar = ""
        for(i = 0; i < 20; i++) {
            if(percentage >= 5) {
                percentage -= 5
                bar += client.element.SYMBOL_LINE
            } else if(percentage !== null) {
                percentage = null
                bar += client.element.SYMBOL_CIRCLE
            } else bar += " "
        }
        return `\`${queue.formattedCurrentTime} ${bar} ${song.formattedDuration}\``
    }

    // Help
    client.help = async (lang, channel, command) => {
        if(!command) {
            const commands = client.commands.filter(item => item.help.type === "command" && item.help.name !== "help").map((item, i) => { return `\`${item.help.name}\`` }).join(", ")
            const filters = client.commands.filter(item => item.help.type === "filter").map((item, i) => { return `\`${item.help.name}\`` }).join(", ")
            const helpEmbed = new Discord.MessageEmbed().setAuthor({ name: "Help", iconURL: client.element.ICON_FLOPY }).addFields({ name: `**${lang.HELP_COMMANDS}**`, value: `${commands}` }, { name: `**${lang.HELP_FILTERS}**`, value: `${filters}` }).setFooter({ text: `${lang.HELP_DETAILS} ${client.config.PREFIX}help <command>` }).setColor(client.element.COLOR_FLOPY)
            channel.send({ embeds: [helpEmbed] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 10000))
        } else {
            const commandEmbed = new Discord.MessageEmbed().setAuthor({ name: `Help: ${command.help.name}`, iconURL: client.element.ICON_FLOPY }).addFields({ name: `**${lang.HELP_DESCRIPTION}**`, value: `${eval("lang." + command.help.description)}` }, { name: `**${lang.HELP_USAGE}**`, value: `\`${client.config.PREFIX}${command.help.name}${command.help.usage}\`` }).setColor(client.element.COLOR_FLOPY)
            channel.send({ embeds: [commandEmbed] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 8000))
        }
    }
}