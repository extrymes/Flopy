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
        createUser.save().then(g => console.log("[+] New user".blue))
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

    // Check channel
    client.checkChannel = (guild, member) => {
        const clientChannel = guild.me.voice.channel || false
        const memberChannel = member.voice.channel
        if(clientChannel === memberChannel) return true
        else return false
    }

    // Send correct
    client.sendCorrect = async (channel, content) => {
        const correctEmbed = new Discord.MessageEmbed().setTitle(`${content}`).setColor(client.element.COLOR_FLOPY)
        channel?.send({ embeds: [correctEmbed] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 5000))
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

    // Send first message
    client.sendFirstMessage = async guild => {
        let firstChannel = false
        const firstEmbed = new Discord.MessageEmbed().setTitle("Get ready to listen to some music!").setDescription("Thank you for adding me to your server.\nTo start listening to music, mention me in a channel.").setImage(client.element.BANNER_FLOPY).setColor(client.element.COLOR_FLOPY)
        guild.channels.cache.forEach(channel => {
            if(!firstChannel && channel.type === "GUILD_TEXT" && channel.viewable && channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
                firstChannel = true
                channel.send({ embeds: [firstEmbed] }).catch(error => {})
            }
        })
    }

    // Send update message
    client.sendUpdateMessage = async (guild, lang) => {
        const channel = dashboard[guild.id]?.channel
        const updateEmbed = new Discord.MessageEmbed().setAuthor({ name: `${lang.UPDATE_TITLE}`, iconURL: client.element.ICON_FLOPY }).setDescription(lang.UPDATE_DESCRIPTION).setImage(client.element.BANNER_FLOPY).setColor(client.element.COLOR_FLOPY)
        const hideButton = new Discord.MessageActionRow().addComponents(new Discord.MessageButton().setCustomId("Hide()").setStyle("SECONDARY").setEmoji(client.element.EMOJI_UPDATE))
        channel?.send({ embeds: [updateEmbed], components: [hideButton] }).catch(error => {})
    }

    // Setup dashboard
    client.setupDashboard = async (guild, settings, channel) => {
        const langEmbed = new Discord.MessageEmbed().setTitle("Choose a language").setImage(client.element.BANNER_DASHBOARD).setColor(client.element.COLOR_FLOPY)
        const langButtons = new Discord.MessageActionRow().addComponents(new Discord.MessageButton().setCustomId("Lang(\"en\")").setStyle("SECONDARY").setEmoji(client.element.EMOJI_LANG_EN), new Discord.MessageButton().setCustomId("Lang(\"fr\")").setStyle("SECONDARY").setEmoji(client.element.EMOJI_LANG_FR))
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
        const song = queue?.songs[0]
        const dashboardEmbed = new Discord.MessageEmbed()
        const dashboardButtons = new Discord.MessageActionRow()
        if(song) {
            const songs = queue.songs.slice(1, client.config.QUEUE_MAX_DISPLAY + 1).map((item, i) => { return `${i + 1}. ${item.name.length > client.config.SONG_MAX_LENGTH ? item.name.substring(0, client.config.SONG_MAX_LENGTH) + "..." : item.name}` }).reverse().join("\n")
            const queueCount = queue.songs.length - 1
            const queueList = `${queueCount <= client.config.QUEUE_MAX_DISPLAY ? `\n${songs || lang.DASHBOARD_QUEUE_NO_SONG}` : `\n**${queueCount - client.config.QUEUE_MAX_DISPLAY} ${lang.DASHBOARD_QUEUE_MORE_SONG}**\n${songs}`}`
            const thumbnail = song.thumbnail || client.element.BANNER_DASHBOARD_2
            const avatar = song.member.displayAvatarURL() || song.member.user.displayAvatarURL()
            const repeat = `${lang.DASHBOARD_REPEAT} ${queue.repeatMode === 0 ? lang.DASHBOARD_REPEAT_OFF : queue.repeatMode === 1 ? lang.DASHBOARD_REPEAT_SONG : lang.DASHBOARD_REPEAT_QUEUE}`
            const volume = `${lang.DASHBOARD_VOLUME} ${queue.volume}%`
            const emoji = queue.playing ? client.element.EMOJI_PAUSE : client.element.EMOJI_PLAY
            dashboardEmbed.setTitle(`[${song.formattedDuration}] ${song.name}`).setImage(thumbnail).setFooter({ text: `${repeat} | ${volume}`, iconURL: avatar }).setColor(client.element.COLOR_WHITE)
            dashboardButtons.addComponents(new Discord.MessageButton().setCustomId("PlayPause()").setStyle("SECONDARY").setEmoji(emoji), new Discord.MessageButton().setCustomId("Stop()").setStyle("SECONDARY").setEmoji(client.element.EMOJI_STOP), new Discord.MessageButton().setCustomId("Skip()").setStyle("SECONDARY").setEmoji(client.element.EMOJI_SKIP), new Discord.MessageButton().setCustomId("Repeat()").setStyle("SECONDARY").setEmoji(client.element.EMOJI_REPEAT), new Discord.MessageButton().setCustomId("Volume()").setStyle("SECONDARY").setEmoji(client.element.EMOJI_VOLUME))
            dashboard[guild.id]?.edit({ content: `**__${lang.DASHBOARD_QUEUE}__** ${queueList}`, embeds: [dashboardEmbed], components: [dashboardButtons] }).catch(error => {})
        } else {
            dashboardEmbed.setTitle(`${lang.DASHBOARD_SONG_NO_PLAYING}`).setDescription(`[Flopy](${client.config.INVITE_FLOPY}) | [Flopy 2](${client.config.INVITE_FLOPY2}) | [Flopy 3](${client.config.INVITE_FLOPY3})`).setImage(client.element.BANNER_DASHBOARD).setFooter({ text: `${lang.DASHBOARD_HELP_COMMAND} ${client.config.PREFIX}help` }).setColor(client.element.COLOR_FLOPY)
            dashboardButtons.addComponents(new Discord.MessageButton().setCustomId("PlayPause()").setStyle("SECONDARY").setEmoji(client.element.EMOJI_PLAY).setDisabled(), new Discord.MessageButton().setCustomId("Stop()").setStyle("SECONDARY").setEmoji(client.element.EMOJI_STOP).setDisabled(), new Discord.MessageButton().setCustomId("Skip()").setStyle("SECONDARY").setEmoji(client.element.EMOJI_SKIP).setDisabled(), new Discord.MessageButton().setCustomId("Repeat()").setStyle("SECONDARY").setEmoji(client.element.EMOJI_REPEAT).setDisabled(), new Discord.MessageButton().setCustomId("Volume()").setStyle("SECONDARY").setEmoji(client.element.EMOJI_VOLUME).setDisabled())
            dashboard[guild.id]?.edit({ content: `**__${lang.DASHBOARD_QUEUE}__**\n${lang.DASHBOARD_QUEUE_NONE}`, embeds: [dashboardEmbed], components: [dashboardButtons] }).catch(error => {})
        }
    }

    // Create bar
    client.createBar = async (queue, song) => {
        let percentage = ((queue.currentTime / song.duration) * 100).toFixed(0)
        let bar = ""
        for(i = 0; i < 20; i++) {
            if(percentage >= 5) {
                percentage = percentage - 5
                bar = bar + client.element.SYMBOL_LINE
            } else if(percentage !== -1) {
                percentage = -1
                bar = bar + client.element.SYMBOL_CIRCLE
            } else bar = bar + " "
        }
        return `\`${queue.formattedCurrentTime} ${bar} ${song.formattedDuration}\``
    }

    // Help
    client.help = async (lang, channel, name) => {
        if(!name) {
            const commands = client.commands.filter(item => item.help.type === "command" && item.help.name !== "help").map((item, i) => { return `\`${item.help.name}\`` }).join(", ")
            const filters = client.commands.filter(item => item.help.type === "filter").map((item, i) => { return `\`${item.help.name}\`` }).join(", ")
            const helpEmbed = new Discord.MessageEmbed().setAuthor({ name: `${lang.HELP_COMMAND.replace("%s", "Help")}`, iconURL: client.element.ICON_FLOPY }).addFields({ name: `**${lang.HELP_COMMAND_2}**`, value: `${commands}` }, { name: `**${lang.HELP_FILTER_2}**`, value: `${filters}` }).setFooter({ text: `${lang.HELP_DETAILS} ${client.config.PREFIX}help <command>` }).setColor(client.element.COLOR_FLOPY)
            channel.send({ embeds: [helpEmbed] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 10000))
        } else {
            const command = client.commands.find(item => item.help.name === name)
            const commandEmbed = new Discord.MessageEmbed().setAuthor({ name: `${eval(command.help.title).replace("%s", command.help.name.charAt(0).toUpperCase() + command.help.name.slice(1))}`, iconURL: client.element.ICON_FLOPY }).addFields({ name: `**${lang.HELP_DESCRIPTION}**`, value: `${eval(command.help.description)}` }, { name: `**${lang.HELP_USAGE}**`, value: `\`${client.config.PREFIX}${command.help.name}${command.help.usage}\`` }).setColor(client.element.COLOR_FLOPY)
            channel.send({ embeds: [commandEmbed] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 8000))
        }
    }
}