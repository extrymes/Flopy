const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require("discord.js")
const { Guild, User } = require("../models/index")
const mongoose = require("mongoose")
const elements = require("../util/elements")

module.exports = client => {
    // Create guild in the database
    client.createGuild = async guild => {
        const newGuild = { guildID: guild.id }
        const merged = Object.assign({ _id: mongoose.Types.ObjectId() }, newGuild)
        const createGuild = await new Guild(merged)
        createGuild.save().then(g => console.log("[+] New guild".blue))
    }

    // Get guild in the database
    client.getGuild = async guild => {
        const data = await Guild.findOne({ guildID: guild.id })
        if(data) return data
        return Object.assign(client.config.GUILD_DEFAULTSETTINGS, { "null": true })
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
        return Object.assign(client.config.USER_DEFAULTSETTINGS, { "null": true })
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
        await User.deleteOne({ userID: user.id }).then(console.log(`[~] Old user`.blue))
    }

    // Check sendable
    client.checkSendable = (guild, channel) => {
        if(channel.viewable && channel.permissionsFor(guild.members.me).has("SendMessages") && channel.permissionsFor(guild.members.me).has("EmbedLinks")) return true
        return false
    }

    // Check manager
    client.checkManager = member => {
        if(member.permissions.has("ManageGuild")) return true
        return false
    }

    // Check voice
    client.checkVoice = (guild, member) => {
        const voice = guild.members.me.voice.channel || false
        if(voice === member.voice.channel) return true
        return false
    }

    // Leave voice
    client.leaveVoice = guild => {
        client.cooldown("joinVoice" + guild.id, 1000)
        client.distube.voices.leave(guild)
    }

    // Send message
    client.sendMessage = (channel, content) => {
        const messageEmbed = new EmbedBuilder().setTitle(`${content}`).setColor(elements.COLOR_FLOPY)
        channel?.send({ embeds: [messageEmbed] }).then(m => setTimeout(() => m?.delete().catch(error => {}), 4000)).catch(error => {})
    }

    // Send first message
    client.sendFirstMessage = guild => {
        const channel = guild.channels.cache.filter(item => item.type === ChannelType.GuildText && client.checkSendable(guild, item)).first()
        const firstEmbed = new EmbedBuilder().setTitle("Get ready to listen to music easily!").setDescription(`To begin, use \`/setup\` command in a channel.\nIf you need help, here is the [support server](${elements.INVITE_SUPPORT}).`).setImage(elements.BANNER_FLOPY).setColor(elements.COLOR_FLOPY)
        channel?.send({ embeds: [firstEmbed] }).catch(error => {})
    }

    // Send help message
    client.sendHelpMessage = (guild, channel, lang) => {
        const helpEmbed = new EmbedBuilder().setAuthor({ name: `${lang.HELP_MESSAGE}`, iconURL: elements.ICON_FLOPY }).setDescription(`${client.cache["dashboard" + guild.id] ? lang.HELP_PLAY_SONG.replace("$channel", `${client.cache["dashboard" + guild.id]?.channel}`) : lang.HELP_SETUP_DASHBOARD.replace("$command", `\`/setup\``)}`).setColor(elements.COLOR_FLOPY)
        channel?.send({ embeds: [helpEmbed] }).catch(error => {})
    }

    // Send update message
    client.sendUpdateMessage = (guild, lang) => {
        const channel = client.cache["dashboard" + guild.id]?.channel
        const updateEmbed = new EmbedBuilder().setAuthor({ name: `${lang.UPDATE_TITLE}`, iconURL: elements.ICON_FLOPY }).setDescription(`${lang.UPDATE_DESCRIPTION}`).setImage(elements.BANNER_FLOPY).setColor(elements.COLOR_FLOPY)
        const hideButton = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("hide").setStyle(ButtonStyle.Secondary).setEmoji(elements.EMOJI_UPDATE))
        channel?.send({ embeds: [updateEmbed], components: [hideButton] }).catch(error => {})
    }

    // Send error
    client.sendError = (channel, content) => {
        const errorEmbed = new EmbedBuilder().setTitle(`${content}`).setColor(elements.COLOR_GREY)
        channel?.send({ embeds: [errorEmbed] }).then(m => setTimeout(() => m?.delete().catch(error => {}), 4000)).catch(error => {})
    }

    // Reply message
    client.replyMessage = (interaction, edit, content) => {
        const messageEmbed = new EmbedBuilder().setTitle(`${content}`).setColor(elements.COLOR_FLOPY)
        if(edit) interaction.editReply({ embeds: [messageEmbed] }).catch(error => {})
        else interaction.reply({ embeds: [messageEmbed] }).catch(error => {})
        setTimeout(() => interaction.deleteReply().catch(error => {}), 4000)
    }

    // Reply error
    client.replyError = (interaction, edit, content) => {
        const errorEmbed = new EmbedBuilder().setTitle(`${content}`).setColor(elements.COLOR_GREY)
        if(edit) {
            interaction.editReply({ embeds: [errorEmbed] }).catch(error => {})
            setTimeout(() => interaction.deleteReply().catch(error => {}), 4000)
        } else interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(error => {})
    }

    // Create dashboard
    client.createDashboard = (guild, queue, lang) => {
        const song = queue?.songs[0]
        if(song) {
            const songs = queue.songs.slice(1, client.config.QUEUE_MAX_LENGTH + 1).map((item, i) => { return `${i + 1}. ${item.name.length <= client.config.SONG_MAX_LENGTH ? item.name : item.name.substring(0, client.config.SONG_MAX_LENGTH) + "..."}` }).reverse().join("\n")
            const dashboardContent = `**__${lang.DASHBOARD_QUEUE}__**\n${queue.songs.length - 1 <= client.config.QUEUE_MAX_LENGTH ? "" : `**+${queue.songs.length - 1 - client.config.QUEUE_MAX_LENGTH}**\n`}${songs || lang.DASHBOARD_QUEUE_NO_SONG}`
            const dashboardEmbed = new EmbedBuilder().setTitle(`[${song.formattedDuration}] ${song.name}`).setImage(song.thumbnail || elements.BANNER_SECONDARY).setFooter({ text: `${lang.DASHBOARD_VOLUME} ${queue.volume}%${queue.repeatMode === 0 ? "" : queue.repeatMode === 1 ? ` | ${lang.DASHBOARD_REPEAT_SONG}` : ` | ${lang.DASHBOARD_REPEAT_QUEUE}`}${queue.autoplay ? ` | ${lang.DASHBOARD_AUTOPLAY_ON}` : ""}${queue.filters.size < 1 ? "" : ` | ${lang.DASHBOARD_FILTERS} ${queue.filters.size}`}` }).setColor(guild.members.me.displayHexColor.replace("#000000", elements.COLOR_WHITE))
            const dashboardButtons = new ActionRowBuilder().addComponents(queue.playing ? new ButtonBuilder().setCustomId("pause").setStyle(ButtonStyle.Secondary).setEmoji(elements.EMOJI_PAUSE) : new ButtonBuilder().setCustomId("resume").setStyle(ButtonStyle.Primary).setEmoji(elements.EMOJI_PLAY), new ButtonBuilder().setCustomId("stop").setStyle(ButtonStyle.Secondary).setEmoji(elements.EMOJI_STOP), new ButtonBuilder().setCustomId("skip").setStyle(ButtonStyle.Secondary).setEmoji(elements.EMOJI_SKIP), new ButtonBuilder().setCustomId("repeat").setStyle(ButtonStyle.Secondary).setEmoji(elements.EMOJI_REPEAT), new ButtonBuilder().setCustomId("volume").setStyle(ButtonStyle.Secondary).setEmoji(elements.EMOJI_VOLUME))
            return { content: dashboardContent, embeds: [dashboardEmbed], components: [dashboardButtons] }
        } else {
            const dashboardContent = `**__${lang.DASHBOARD_QUEUE}__**\n${lang.DASHBOARD_QUEUE_NONE}`
            const dashboardEmbed = new EmbedBuilder().setTitle(`${lang.DASHBOARD_SONG_NO_PLAYING}`).setDescription(`[Flopy](${elements.INVITE_FLOPY}) | [Flopy 2](${elements.INVITE_FLOPY2}) | [Flopy 3](${elements.INVITE_FLOPY3}) | [Support](${elements.INVITE_SUPPORT})`).setImage(elements.BANNER_PRIMARY).setColor(elements.COLOR_FLOPY)
            const dashboardButtons = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("resume").setStyle(ButtonStyle.Secondary).setEmoji(elements.EMOJI_PLAY).setDisabled(), new ButtonBuilder().setCustomId("stop").setStyle(ButtonStyle.Secondary).setEmoji(elements.EMOJI_STOP).setDisabled(), new ButtonBuilder().setCustomId("skip").setStyle(ButtonStyle.Secondary).setEmoji(elements.EMOJI_SKIP).setDisabled(), new ButtonBuilder().setCustomId("repeat").setStyle(ButtonStyle.Secondary).setEmoji(elements.EMOJI_REPEAT).setDisabled(), new ButtonBuilder().setCustomId("volume").setStyle(ButtonStyle.Secondary).setEmoji(elements.EMOJI_VOLUME).setDisabled())
            return { content: dashboardContent, embeds: [dashboardEmbed], components: [dashboardButtons] }
        }
    }

    // Get dashboard
    client.getDashboard = async (guild, settings) => {
        const channel = guild.channels.cache.get(settings.flopy1.channel)
        await channel?.messages?.fetch(settings.flopy1.message).then(message => {
            if(message) client.cache["dashboard" + guild.id] = message
        }).catch(error => {})
    }

    // Send dashboard
    client.sendDashboard = (guild, channel, settings, queue, lang) => {
        const dashboard = client.createDashboard(guild, queue, lang)
        client.cooldown("leaveVoice" + guild.id, 1000)
        client.cache["dashboard" + guild.id]?.delete().catch(error => {})
        channel?.send(dashboard).then(message => {
            if(message) {
                client.cache["dashboard" + guild.id] = message
                client.updateGuild(guild, { flopy1: Object.assign(settings.flopy1, { "channel": channel.id, "message": message.id }) })
            } else client.leaveVoice(guild)
        }).catch(error => {})
    }

    // Edit dashboard
    client.editDashboard = (guild, queue, lang) => {
        const dashboard = client.createDashboard(guild, queue, lang)
        client.cache["dashboard" + guild.id]?.edit(dashboard).catch(error => {})
    }

    // Create bar
    client.createBar = queue => {
        const song = queue.songs[0]
        const progress = Number(Math.min(((queue.currentTime / song.duration) * client.config.BAR_MAX_LENGTH).toFixed(0), client.config.BAR_MAX_LENGTH))
        const rest = client.config.BAR_MAX_LENGTH - progress
        let bar = ""
        for(i = 0; i < progress; i++) {
            bar += elements.SYMBOL_LINE
        }
        bar += elements.SYMBOL_CIRCLE
        for(i = 0; i < rest; i++) {
            bar += " "
        }
        return `\`${queue.formattedCurrentTime} ${bar} ${song.formattedDuration}\``
    }

    // Convert time
    client.convertTime = time => {
        let sec = 0
        sec += Number(time[time.length - 1] || 0)
        sec += Number(time[time.length - 2] || 0) * 10
        sec += Number(time[time.length - 3] || 0) * 60
        sec += Number(time[time.length - 4] || 0) * 60 * 10
        sec += Number(time[time.length - 5] || 0) * 60 * 60
        sec += Number(time[time.length - 6] || 0) * 60 * 60 * 10
        return sec
    }

    // Get error message
    client.getErrorMessage = (error, lang) => {
        if(error.includes("I do not have permission to join this voice channel") || error.includes("Cannot connect to the voice channel") || error.includes("The voice channel is full")) return `${lang.ERROR_VOICE_UNABLE_JOIN}`
        if(error.includes("No result found") || error.includes("Cannot resolve undefined to a Song") || error.includes("search string is mandatory")) return `${lang.ERROR_RESULT_NO_FOUND}`
        if(error.includes("Video unavailable") || error.includes("This video is unavailable")) return `${lang.ERROR_VIDEO_UNAVAILABLE}`
        if(error.includes("Sign in to confirm your age") || error.includes("Sorry, this content is age-restricted") || error.includes("This video is only available to Music Premium members")) return `${lang.ERROR_VIDEO_RESTRICTED}`
        if(error.includes("Unsupported URL") || error.includes("This url is not supported")) return `${lang.ERROR_URL_UNSUPPORTED}`
        if(error.includes("Unknown Playlist")) return `${lang.ERROR_PLAYLIST_UNKNOWN}`
        console.log(error)
        return `${lang.ERROR_OCCURED}`
    }

    // Cooldown
    client.cooldown = (id, time) => {
        if(client.cache["cooldown" + id]) return true
        client.cache["cooldown" + id] = true
        setTimeout(() => delete client.cache["cooldown" + id], time)
        return false
    }
}