const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require("discord.js")
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
        const voice = guild.members.me.voice.channel || false
        if(voice === member.voice.channel) return true
        else return false
    }

    // Leave voice
    client.leaveVoice = guild => {
        client.cooldown("joinVoice" + guild.id, 1000)
        client.distube.voices.leave(guild)
    }

    // Check manager
    client.checkManager = member => {
        if(member.permissions.has("ManageGuild")) return true
        else return false
    }

    // Send message
    client.sendMessage = (channel, content) => {
        const messageEmbed = new EmbedBuilder().setTitle(`${content}`).setColor(client.elements.COLOR_FLOPY)
        channel?.send({ embeds: [messageEmbed] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 5000))
    }

    // Send help message
    client.sendHelpMessage = (channel, lang, command) => {
        if(!command) {
            const commands = client.commands.filter(item => item.data.type === "command" && item.data.name !== "help").map((item, i) => { return `\`${item.data.name}\`` }).join(", ")
            const filters = client.commands.filter(item => item.data.type === "filter").map((item, i) => { return `\`${item.data.name}\`` }).join(", ")
            const helpEmbed = new EmbedBuilder().setAuthor({ name: "Help", iconURL: client.elements.ICON_FLOPY }).addFields({ name: `**${lang.HELP_COMMANDS}**`, value: `${commands}` }, { name: `**${lang.HELP_FILTERS}**`, value: `${filters}` }).setFooter({ text: `${lang.HELP_DETAILS} ${client.config.PREFIX}help <command>` }).setColor(client.elements.COLOR_FLOPY)
            channel.send({ embeds: [helpEmbed] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 10000))
        } else {
            const commandEmbed = new EmbedBuilder().setAuthor({ name: `Help: ${command.data.name}`, iconURL: client.elements.ICON_FLOPY }).addFields({ name: `**${lang.HELP_DESCRIPTION}**`, value: `${eval("lang." + command.data.description)}` }, { name: `**${lang.HELP_USAGE}**`, value: `\`${client.config.PREFIX}${command.data.name}${command.data.usage}\`` }).setColor(client.elements.COLOR_FLOPY)
            channel.send({ embeds: [commandEmbed] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 8000))
        }
    }

    // Send first message
    client.sendFirstMessage = guild => {
        const channel = guild.channels.cache.filter(item => item.type === ChannelType.GuildText && item.viewable && item.permissionsFor(guild.members.me).has("SendMessages")).first()
        const firstEmbed = new EmbedBuilder().setTitle("Get ready to listen to music with style!").setDescription(`Thank you for inviting me to your server.\nTo start listening to music, mention me in a channel.\n\nThen use the \`${client.config.PREFIX}help\` command to see all features.`).setImage(client.elements.BANNER_FLOPY).setColor(client.elements.COLOR_FLOPY)
        channel?.send({ embeds: [firstEmbed] }).catch(error => {})
    }

    // Send update message
    client.sendUpdateMessage = (guild, lang) => {
        const channel = client.cache["dashboard" + guild.id]?.channel
        const updateEmbed = new EmbedBuilder().setAuthor({ name: `${lang.UPDATE_TITLE}`, iconURL: client.elements.ICON_FLOPY }).setDescription(lang.UPDATE_DESCRIPTION).setImage(client.elements.BANNER_FLOPY).setColor(client.elements.COLOR_FLOPY)
        const hideButton = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("hide").setStyle(ButtonStyle.Secondary).setEmoji(client.elements.EMOJI_UPDATE))
        channel?.send({ embeds: [updateEmbed], components: [hideButton] }).catch(error => {})
    }

    // Send error
    client.sendError = (channel, content) => {
        const errorEmbed = new EmbedBuilder().setTitle(`${content}`).setColor(client.elements.COLOR_GREY)
        channel?.send({ embeds: [errorEmbed] }).catch(error => {}).then(m => setTimeout(() => m?.delete().catch(error => {}), 5000))
    }

    // Reply error
    client.replyError = (interaction, content) => {
        const errorEmbed = new EmbedBuilder().setTitle(`${content}`).setColor(client.elements.COLOR_GREY)
        interaction.reply({ embeds: [errorEmbed], ephemeral: true })
    }

    // Setup dashboard
    client.setupDashboard = (guild, channel, settings) => {
        const setupEmbed = new EmbedBuilder().setTitle("Language selection").setImage(client.elements.BANNER_PRIMARY).setColor(client.elements.COLOR_FLOPY)
        const langButtons = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("lang_en").setStyle(ButtonStyle.Secondary).setEmoji(client.elements.EMOJI_LANG_EN), new ButtonBuilder().setCustomId("lang_fr").setStyle(ButtonStyle.Secondary).setEmoji(client.elements.EMOJI_LANG_FR))
        client.cooldown("leaveVoice" + guild.id, 1000)
        client.cache["dashboard" + guild.id]?.delete().catch(error => {})
        channel.send({ embeds: [setupEmbed], components: [langButtons] }).catch(error => {}).then(message => {
            if(message) {
                client.cache["dashboard" + guild.id] = message
                client.updateGuild(guild, { flopy1: Object.assign(settings.flopy1, { "channel": channel.id, "message": message.id }) })
            } else client.leaveVoice(guild)
        })
    }

    // Get dashboard
    client.getDashboard = async (guild, settings) => {
        const channel = guild.channels.cache.get(settings.flopy1.channel)
        await channel?.messages?.fetch(settings.flopy1.message).catch(error => {}).then(message => {
            if(message) client.cache["dashboard" + guild.id] = message
        })
    }

    // Update dashboard
    client.updateDashboard = (guild, queue, lang) => {
        const song = queue?.songs[0]
        if(song) {
            const songs = queue.songs.slice(1, client.config.QUEUE_MAX_DISPLAY + 1).map((item, i) => { return `${i + 1}. ${item.name.length <= client.config.SONG_MAX_LENGTH ? item.name : item.name.substring(0, client.config.SONG_MAX_LENGTH) + "..."}` }).reverse().join("\n")
            const dashboardEmbed = new EmbedBuilder().setTitle(`[${song.formattedDuration}] ${song.name}`).setImage(song.thumbnail || client.elements.BANNER_SECONDARY).setFooter({ text: `${lang.DASHBOARD_VOLUME} ${queue.volume}%${queue.repeatMode === 0 ? "" : queue.repeatMode === 1 ? ` | ${lang.DASHBOARD_REPEAT_SONG}` : ` | ${lang.DASHBOARD_REPEAT_QUEUE}`}${queue.autoplay ? ` | ${lang.DASHBOARD_AUTOPLAY_ON}` : ""}${queue.filters.size < 1 ? "" : ` | ${lang.DASHBOARD_FILTERS} ${queue.filters.size}`}` }).setColor(guild.members.me.displayHexColor.replace("#000000", client.elements.COLOR_WHITE))
            const dashboardButtons = new ActionRowBuilder().addComponents(queue.playing ? new ButtonBuilder().setCustomId("pause").setStyle(ButtonStyle.Secondary).setEmoji(client.elements.EMOJI_PAUSE) : new ButtonBuilder().setCustomId("resume").setStyle(ButtonStyle.Primary).setEmoji(client.elements.EMOJI_PLAY), new ButtonBuilder().setCustomId("stop").setStyle(ButtonStyle.Secondary).setEmoji(client.elements.EMOJI_STOP), new ButtonBuilder().setCustomId("skip").setStyle(ButtonStyle.Secondary).setEmoji(client.elements.EMOJI_SKIP), new ButtonBuilder().setCustomId("repeat").setStyle(ButtonStyle.Secondary).setEmoji(client.elements.EMOJI_REPEAT), new ButtonBuilder().setCustomId("volume").setStyle(ButtonStyle.Secondary).setEmoji(client.elements.EMOJI_VOLUME))
            client.cache["dashboard" + guild.id]?.edit({ content: `**__${lang.DASHBOARD_QUEUE}__**\n${queue.songs.length - 1 <= client.config.QUEUE_MAX_DISPLAY ? "" : `**+${queue.songs.length - 1 - client.config.QUEUE_MAX_DISPLAY}**\n`}${songs || lang.DASHBOARD_QUEUE_NO_SONG}`, embeds: [dashboardEmbed], components: [dashboardButtons] }).catch(error => {})
        } else {
            const dashboardEmbed = new EmbedBuilder().setTitle(`${lang.DASHBOARD_SONG_NO_PLAYING}`).setDescription(`[Flopy](${client.config.INVITE_FLOPY}) | [Flopy 2](${client.config.INVITE_FLOPY2}) | [Flopy 3](${client.config.INVITE_FLOPY3})`).setImage(client.elements.BANNER_PRIMARY).setFooter({ text: `${lang.DASHBOARD_HELP_COMMAND} ${client.config.PREFIX}help` }).setColor(client.elements.COLOR_FLOPY)
            const dashboardButtons = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("resume").setStyle(ButtonStyle.Secondary).setEmoji(client.elements.EMOJI_PLAY).setDisabled(), new ButtonBuilder().setCustomId("stop").setStyle(ButtonStyle.Secondary).setEmoji(client.elements.EMOJI_STOP).setDisabled(), new ButtonBuilder().setCustomId("skip").setStyle(ButtonStyle.Secondary).setEmoji(client.elements.EMOJI_SKIP).setDisabled(), new ButtonBuilder().setCustomId("repeat").setStyle(ButtonStyle.Secondary).setEmoji(client.elements.EMOJI_REPEAT).setDisabled(), new ButtonBuilder().setCustomId("volume").setStyle(ButtonStyle.Secondary).setEmoji(client.elements.EMOJI_VOLUME).setDisabled())
            client.cache["dashboard" + guild.id]?.edit({ content: `**__${lang.DASHBOARD_QUEUE}__**\n${lang.DASHBOARD_QUEUE_NONE}`, embeds: [dashboardEmbed], components: [dashboardButtons] }).catch(error => {})
        }
    }

    // Refresh dashboard
    client.refreshDashboard = (guild, settings, queue, lang) => {
        const channel = client.cache["dashboard" + guild.id]?.channel
        client.cooldown("leaveVoice" + guild.id, 1000)
        client.cache["dashboard" + guild.id]?.delete().catch(error => {})
        channel?.send({ content: "ㅤ" }).catch(error => {}).then(message => {
            if(message) {
                client.cache["dashboard" + guild.id] = message
                client.updateGuild(guild, { flopy1: Object.assign(settings.flopy1, { "message": message.id }) })
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
}