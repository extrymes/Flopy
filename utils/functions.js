const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require("discord.js");
const { Guild, User } = require("../models/index");
const config = require("../admin/config");
const elements = require("./elements");

module.exports = (client) => {
	// Create guild data in database
	client.createGuildData = async (guild) => {
		const guildData = await Guild.create({ guildID: guild.id });
		if (!guildData) throw new Error("Error when creating guild data!");
		console.log(`[+] New guild data: ${guild.id}`.blue);
		guildData.flopy1.newGuild = true;
		return guildData.flopy1;
	}

	// Get guild data in database
	client.getGuildData = async (guild) => {
		const guildData = await Guild.findOne({ guildID: guild.id });
		if (!guildData) return client.createGuildData(guild);
		return guildData.flopy1;
	}

	// Update guild data in database
	client.updateGuildData = async (guild, data) => {
		const guildData = await client.getGuildData(guild);
		const newGuildData = { flopy1: { ...guildData, ...data } };
		const result = await Guild.updateOne({ guildID: guild.id }, newGuildData);
		if (result.modifiedCount === 0) throw new Error("Error when updating guild data!");
		return true;
	}

	// Create user data in database
	client.createUserData = async (user) => {
		const userData = await User.create({ userID: user.id });
		if (!userData) throw new Error("Error when creating user data!");
		console.log(`[+] New user data: ${user.id}`.blue);
		userData.newUser = true;
		return userData;
	}

	// Get user data in database
	client.getUserData = async (user) => {
		const userData = await User.findOne({ userID: user.id });
		if (!userData) return client.createUserData(user);
		return userData;
	}

	// Update user data in database
	client.updateUserData = async (user, data) => {
		const result = await User.updateOne({ userID: user.id }, data);
		if (result.modifiedCount === 0) throw new Error("Error when updating user data!");
		return true;
	}

	// Check if message can be sent
	client.checkMessageIsSendable = (guild, channel) => {
		const member = guild.members.me;
		if (channel.viewable && channel.permissionsFor(member).has("SendMessages") && channel.permissionsFor(member).has("EmbedLinks") && Date.now() > member.communicationDisabledUntil) return true;
		return false;
	}

	// Check if member is a guild manager
	client.checkMemberIsManager = (member) => {
		if (member.permissions.has("ManageGuild")) return true;
		return false;
	}

	// Check if member is in my voice channel
	client.checkMemberIsInMyVoiceChannel = (guild, member) => {
		const voiceChannel = guild.members.me.voice.channel;
		if (voiceChannel === member.voice.channel) return true;
		return false;
	}

	// Check if my voice channel is empty
	client.checkMyVoiceChannelIsEmpty = (guild) => {
		const voiceChannel = guild.members.me.voice.channel;
		if (!voiceChannel) return true;
		const voiceChannelMembers = voiceChannel.members.filter((member) => !member.user.bot);
		if (voiceChannelMembers.size === 0) return true;
		return false;
	}

	// Leave voice channel
	client.leaveVoiceChannel = (guild) => {
		client.handleCooldown("joinVoiceChannel", guild.id, 1000);
		client.distube.voices.leave(guild);
	}

	// Send new guild message
	client.sendNewGuildMessage = (guild) => {
		const channel = guild.channels.cache.find((channel) => channel.type === ChannelType.GuildText && client.checkMessageIsSendable(guild, channel));
		const firstEmbed = new EmbedBuilder().setTitle("Get ready to listen to music easily!").setDescription(`To get started, use \`/setup\` command in a channel.\nIf you need help, here is the [support server](${elements.INVITE_SUPPORT}).`).setImage(elements.BANNER_FLOPY).setColor(elements.COLOR_FLOPY);
		if (channel) channel.send({ embeds: [firstEmbed] }).catch((error) => { });
	}

	// Send help message
	client.sendHelpMessage = (guild, channel, lang) => {
		const helpEmbed = new EmbedBuilder().setAuthor({ name: `${lang.HELP_MESSAGE}`, iconURL: elements.ICON_FLOPY }).setDescription(`${client.dashboards[guild.id] ? lang.HELP_PLAY_SONG.replace("$channel", `${client.dashboards[guild.id].channel}`) : lang.HELP_SETUP_DASHBOARD.replace("$command", `\`/setup\``)}`).setColor(elements.COLOR_FLOPY);
		channel.send({ embeds: [helpEmbed] }).catch((error) => { });
	}

	// Send notification
	client.sendNotification = (destination, title, options) => {
		const notificationEmbed = new EmbedBuilder().setTitle(`${title}`).setColor(elements.COLOR_FLOPY);
		if (!destination.token) return destination.send({ embeds: [notificationEmbed] }).then((message) => setTimeout(() => message?.delete().catch((error) => { }), 4000)).catch((error) => { });
		if (options?.editReply) destination.editReply({ embeds: [notificationEmbed], ephemeral: options?.ephemeral }).catch((error) => { });
			else destination.reply({ embeds: [notificationEmbed], ephemeral: options?.ephemeral }).catch((error) => { });
		setTimeout(() => destination.deleteReply().catch((error) => { }), 4000);
	}

	// Send advanced notification
	client.sendAdvancedNotification = (destination, title, description, thumbnail, options) => {
		const notificationEmbed = new EmbedBuilder().setTitle(`${title}`).setDescription(`${description}`).setThumbnail(thumbnail).setColor(elements.COLOR_FLOPY);
		if (!destination.token) return destination.send({ embeds: [notificationEmbed] }).then((message) => setTimeout(() => message?.delete().catch((error) => { }), 4000)).catch((error) => { });
		if (options?.editReply) destination.editReply({ embeds: [notificationEmbed], ephemeral: options?.ephemeral }).catch((error) => { });
			else destination.reply({ embeds: [notificationEmbed], ephemeral: options?.ephemeral }).catch((error) => { });
		setTimeout(() => destination.deleteReply().catch((error) => { }), 4000);
	}

	// Send error notification
	client.sendErrorNotification = (destination, title, options) => {
		const notificationEmbed = new EmbedBuilder().setTitle(`${title}`).setColor(elements.COLOR_GREY);
		if (!destination.token) return destination.send({ embeds: [notificationEmbed] }).then((message) => setTimeout(() => message?.delete().catch((error) => { }), 4000)).catch((error) => { });
		if (options?.editReply) destination.editReply({ embeds: [notificationEmbed], ephemeral: true }).catch((error) => { });
			else destination.reply({ embeds: [notificationEmbed], ephemeral: true }).catch((error) => { });
		setTimeout(() => destination.deleteReply().catch((error) => { }), 4000);
	}

	// Create dashboard
	client.createDashboard = (guild, queue, lang) => {
		const songs = queue?.songs || [];
		const currentSong = songs[0]?.stream?.song || songs[0];
		const formattedSongs = songs.slice(1, config.QUEUE_MAX_LENGTH_DISPLAY + 1).map((song, i) => { return `**${i + 1}.** ${song.name.length > config.ITEM_NAME_MAX_LENGTH_DISPLAY ? song.name.substr(0, config.ITEM_NAME_MAX_LENGTH_DISPLAY).concat("...") : song.name}` }).reverse().join("\n");
		const dashboardContent = `**__${lang.DASHBOARD_QUEUE}__**\n${currentSong ? `${songs.length - 1 > config.QUEUE_MAX_LENGTH_DISPLAY ? `**+${songs.length - 1 - config.QUEUE_MAX_LENGTH_DISPLAY}**\n` : ""}${formattedSongs || lang.DASHBOARD_QUEUE_NO_SONG}` : lang.DASHBOARD_QUEUE_NONE}`;
		const dashboardEmbed = new EmbedBuilder().setTitle(currentSong ? `[${currentSong.formattedDuration}] ${currentSong.name}` : `${lang.DASHBOARD_SONG_NO_PLAYING}`).setDescription(!currentSong ? `[Flopy](${elements.INVITE_FLOPY}) | [Flopy 2](${elements.INVITE_FLOPY2}) | [Flopy 3](${elements.INVITE_FLOPY3}) | [Support](${elements.INVITE_SUPPORT})` : null).setImage(currentSong ? currentSong.thumbnail : elements.BANNER_DASHBOARD).setFooter(currentSong ? { text: `${lang.DASHBOARD_VOLUME} ${queue.volume}%${queue.repeatMode === 1 ? ` | ${lang.DASHBOARD_REPEAT_SONG}` : queue.repeatMode === 2 ? ` | ${lang.DASHBOARD_REPEAT_QUEUE}` : ""}${queue.autoplay ? ` | ${lang.DASHBOARD_AUTOPLAY_ON}` : ""}${queue.filters.size > 0 ? ` | ${lang.DASHBOARD_FILTERS} ${queue.filters.size}` : ""}` } : null).setColor(currentSong ? guild.members.me.displayHexColor.replace("#000000", elements.COLOR_WHITE) : elements.COLOR_FLOPY);
		const dashboardButtons = new ActionRowBuilder().addComponents(queue?.paused ? new ButtonBuilder().setCustomId("resume").setStyle(ButtonStyle.Primary).setEmoji(elements.EMOJI_PLAY) : new ButtonBuilder().setCustomId("pause").setStyle(ButtonStyle.Secondary).setEmoji(elements.EMOJI_PAUSE).setDisabled(!currentSong), new ButtonBuilder().setCustomId("stop").setStyle(ButtonStyle.Secondary).setEmoji(elements.EMOJI_STOP).setDisabled(!currentSong), new ButtonBuilder().setCustomId("skip").setStyle(ButtonStyle.Secondary).setEmoji(elements.EMOJI_SKIP).setDisabled(!currentSong), new ButtonBuilder().setCustomId("repeat").setStyle(queue?.repeatMode > 0 ? ButtonStyle.Primary : ButtonStyle.Secondary).setEmoji(elements.EMOJI_REPEAT).setDisabled(!currentSong), new ButtonBuilder().setCustomId("volume").setStyle(ButtonStyle.Secondary).setEmoji(elements.EMOJI_VOLUME).setDisabled(!currentSong));
		return { content: dashboardContent, embeds: [dashboardEmbed], components: [dashboardButtons] };
	}

	// Get dashboard message
	client.getDashboardMessage = async (guild, guildData) => {
		const dashboardChannel = guild.channels.cache.get(guildData.channel);
		const dashboardMessage = await dashboardChannel.messages.fetch(guildData.message);
		client.dashboards[guild.id] = dashboardMessage;
	}

	// Send dashboard message
	client.sendDashboardMessage = async (guild, channel, queue, lang) => {
		const dashboard = client.createDashboard(guild, queue, lang);
		client.handleCooldown("leaveVoiceChannel", guild.id, 1000);
		client.dashboards[guild.id]?.delete().catch((error) => { });
		const message = await channel.send(dashboard);
		await client.updateGuildData(guild, { channel: channel.id, message: message.id });
		client.dashboards[guild.id] = message;
	}

	// Update dashboard message
	client.updateDashboardMessage = (guild, queue, lang) => {
		const dashboard = client.createDashboard(guild, queue, lang);
		client.dashboards[guild.id]?.edit(dashboard).catch((error) => { });
	}

	// Handle cooldown
	client.handleCooldown = (name, target, time) => {
		const cooldownId = name + target;
		if (client.cooldowns[cooldownId]) return false;
		client.cooldowns[cooldownId] = true;
		setTimeout(() => delete client.cooldowns[cooldownId], time);
		return true;
	}

	// Create duration bar
	client.createDurationBar = (queue, song) => {
		const progress = Math.min(Math.round((queue.currentTime / song.duration) * config.DURATION_BAR_MAX_LENGTH_DISPLAY), config.DURATION_BAR_MAX_LENGTH_DISPLAY);
		const rest = config.DURATION_BAR_MAX_LENGTH_DISPLAY - progress;
		const bar = new Array(progress).fill(elements.SYMBOL_LINE).concat(elements.SYMBOL_CIRCLE).concat(new Array(rest).fill(" ")).join("");
		return `\`${queue.formattedCurrentTime} ${bar} ${song.formattedDuration}\``;
	}

	// Convert HHMMSS to seconds
	client.convertHHMMSSToSeconds = (hhmmss) => {
		const sec = Number(hhmmss.slice(-2));
		const min = Number(hhmmss.slice(-4, -2));
		const hrs = Number(hhmmss.slice(-6, -4));
		return sec + (min * 60) + (hrs * 3600);
	}

	// Get error message
	client.getErrorMessage = (error, lang) => {
		if (error.includes("I do not have permission to join this voice channel") || error.includes("Cannot connect to the voice channel") || error.includes("The voice channel is full")) return `${lang.ERROR_VOICE_CHANNEL_UNABLE_JOIN}`;
		if (error.includes("No result found") || error.includes("Cannot resolve undefined to a Song") || error.includes("search string is mandatory")) return `${lang.ERROR_RESULT_NO_FOUND}`;
		if (error.includes("Video unavailable") || error.includes("This video is unavailable") || error.includes("Premiere will begin shortly")) return `${lang.ERROR_VIDEO_UNAVAILABLE}`;
		if (error.includes("Sign in to confirm your age") || error.includes("Sorry, this content is age-restricted") || error.includes("This video is only available to Music Premium members")) return `${lang.ERROR_VIDEO_RESTRICTED}`;
		if (error.includes("Sign in to confirm you’re not a bot")) return `${lang.ERROR_COOKIES_INVALID}`;
		if (error.includes("Unsupported URL") || error.includes("This url is not supported")) return `${lang.ERROR_URL_UNSUPPORTED}`;
		if (error.includes("Invalid URL")) return `${lang.ERROR_URL_INVALID}`;
		if (error.includes("Unknown Playlist")) return `${lang.ERROR_PLAYLIST_UNKNOWN}`;
		console.error(error);
		return `${lang.ERROR_UNKNOWN}`;
	}
}
