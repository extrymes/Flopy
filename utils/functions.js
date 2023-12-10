const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require("discord.js");
const { Guild, User } = require("../models/index");
const elements = require("./elements");

module.exports = (client) => {
  // Create guild data
  client.createGuildData = async (guild) => {
    const guildData = new Guild({ guildID: guild.id });
    guildData.save().then((data) => console.log(`[+] Guild saved: ${data.guildID}`.blue));
  }

  // Get guild data
  client.getGuildData = async (guild) => {
    const guildData = await Guild.findOne({ guildID: guild.id });
    return guildData;
  }

  // Update guild data
  client.updateGuildData = async (guild, settings) => {
    const guildData = await client.getGuildData(guild);
    return guildData.updateOne(settings);
  }

  // Create user data
  client.createUserData = async (user) => {
    const userData = new User({ userID: user.id });
    userData.save().then((data) => console.log(`[+] User saved: ${data.userID}`.blue));
  }

  // Get user data
  client.getUserData = async (user) => {
    const userData = await User.findOne({ userID: user.id });
    return userData;
  }

  // Update user data
  client.updateUserData = async (user, settings) => {
    const userData = await client.getUserData(user);
    return userData.updateOne(settings);
  }

  // Delete user data
  client.deleteUserData = async (user) => {
    const userData = await client.getUserData(user);
    userData.remove().then((data) => console.log(`[+] User removed: ${data.userID}`.blue));
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

  // Leave voice channel
  client.leaveVoiceChannel = (guild) => {
    client.manageCooldown("joinVoice", guild.id, 1000);
    client.distube.voices.leave(guild);
  }

  // Send first message
  client.sendFirstMessage = (guild) => {
    const channel = guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildText && client.checkMessageIsSendable(guild, channel)).first();
    const firstEmbed = new EmbedBuilder().setTitle("Get ready to listen to music easily!").setDescription(`To get started, use \`/setup\` command in a channel.\nIf you need help, here is the [support server](${elements.INVITE_SUPPORT}).`).setImage(elements.BANNER_FLOPY).setColor(elements.COLOR_FLOPY);
    channel?.send({ embeds: [firstEmbed] }).catch((error) => { });
  }

  // Send help message
  client.sendHelpMessage = (guild, channel, lang) => {
    const helpEmbed = new EmbedBuilder().setAuthor({ name: `${lang.HELP_MESSAGE}`, iconURL: elements.ICON_FLOPY }).setDescription(`${client.dashboards.has(guild.id) ? lang.HELP_PLAY_SONG.replace("$channel", `${client.dashboards.get(guild.id)?.channel}`) : lang.HELP_SETUP_DASHBOARD.replace("$command", `\`/setup\``)}`).setColor(elements.COLOR_FLOPY);
    channel.send({ embeds: [helpEmbed] }).catch((error) => { });
  }

  // Send notification
  client.sendNotification = (destination, title, ephemeral) => {
    const notificationEmbed = new EmbedBuilder().setTitle(`${title}`).setColor(elements.COLOR_FLOPY);
    if (destination?.token) {
      destination.reply({ embeds: [notificationEmbed], ephemeral: ephemeral }).catch((error) => { });
      setTimeout(() => destination.deleteReply().catch((error) => { }), 4000);
    } else destination?.send({ embeds: [notificationEmbed] }).then((message) => setTimeout(() => message?.delete().catch((error) => { }), 4000)).catch((error) => { });
  }

  // Send advanced notification
  client.sendAdvancedNotification = (destination, title, description, thumbnail, editReply) => {
    const notificationEmbed = new EmbedBuilder().setTitle(`${title}`).setDescription(`${description}`).setThumbnail(thumbnail).setColor(elements.COLOR_FLOPY);
    if (destination?.token) {
      if (editReply) destination.editReply({ embeds: [notificationEmbed] }).catch((error) => { });
      else destination.reply({ embeds: [notificationEmbed] }).catch((error) => { });
      setTimeout(() => destination.deleteReply().catch((error) => { }), 4000);
    } else destination?.send({ embeds: [notificationEmbed] }).then((message) => setTimeout(() => message?.delete().catch((error) => { }), 4000)).catch((error) => { });
  }

  // Send error notification
  client.sendErrorNotification = (destination, title, editReply) => {
    const notificationEmbed = new EmbedBuilder().setTitle(`${title}`).setColor(elements.COLOR_GREY);
    if (destination?.token) {
      if (editReply) destination.editReply({ embeds: [notificationEmbed], ephemeral: true }).catch((error) => { });
      else destination.reply({ embeds: [notificationEmbed], ephemeral: true }).catch((error) => { });
      setTimeout(() => destination.deleteReply().catch((error) => { }), 4000);
    } else destination?.send({ embeds: [notificationEmbed] }).then((message) => setTimeout(() => message?.delete().catch((error) => { }), 4000)).catch((error) => { });
  }

  // Create dashboard
  client.createDashboard = (guild, queue, lang) => {
    const currentSong = queue?.songs[0];
    const formattedSongs = queue?.songs?.slice(1, client.config.QUEUE_MAX_DISPLAY + 1).map((song, i) => { return `**${i + 1}.** ${song.name.length > client.config.SONG_MAX_DISPLAY ? song.name.substr(0, client.config.SONG_MAX_DISPLAY).concat("...") : song.name}` }).reverse().join("\n");
    const dashboardContent = `**__${lang.DASHBOARD_QUEUE}__**\n${currentSong && queue.songs.length - 1 > client.config.QUEUE_MAX_DISPLAY ? `**+${queue.songs.length - 1 - client.config.QUEUE_MAX_DISPLAY}**\n` : ""}${currentSong ? (formattedSongs || lang.DASHBOARD_QUEUE_NO_SONG) : lang.DASHBOARD_QUEUE_NONE}`;
    const dashboardEmbed = new EmbedBuilder().setTitle(currentSong ? `[${currentSong.formattedDuration}] ${currentSong.name}` : `${lang.DASHBOARD_SONG_NO_PLAYING}`).setDescription(!currentSong ? `[Flopy](${elements.INVITE_FLOPY}) | [Flopy 2](${elements.INVITE_FLOPY2}) | [Flopy 3](${elements.INVITE_FLOPY3}) | [Support](${elements.INVITE_SUPPORT})` : null).setImage(currentSong ? currentSong.thumbnail : elements.BANNER_DASHBOARD).setFooter(currentSong ? { text: `${lang.DASHBOARD_VOLUME} ${queue.volume}%${queue.repeatMode === 0 ? "" : queue.repeatMode === 1 ? ` | ${lang.DASHBOARD_REPEAT_SONG}` : ` | ${lang.DASHBOARD_REPEAT_QUEUE}`}${queue.autoplay ? ` | ${lang.DASHBOARD_AUTOPLAY_ON}` : ""}${queue.filters.size ? ` | ${lang.DASHBOARD_FILTERS} ${queue.filters.size}` : ""}` } : null).setColor(currentSong ? guild.members.me.displayHexColor.replace("#000000", elements.COLOR_WHITE) : elements.COLOR_FLOPY);
    const dashboardButtons = new ActionRowBuilder().addComponents(currentSong && queue?.playing ? new ButtonBuilder().setCustomId("pause").setStyle(ButtonStyle.Secondary).setEmoji(elements.EMOJI_PAUSE) : new ButtonBuilder().setCustomId("resume").setStyle(ButtonStyle.Primary).setEmoji(elements.EMOJI_PLAY).setDisabled(!currentSong), new ButtonBuilder().setCustomId("stop").setStyle(ButtonStyle.Secondary).setEmoji(elements.EMOJI_STOP).setDisabled(!currentSong), new ButtonBuilder().setCustomId("skip").setStyle(ButtonStyle.Secondary).setEmoji(elements.EMOJI_SKIP).setDisabled(!currentSong), new ButtonBuilder().setCustomId("repeat").setStyle(ButtonStyle.Secondary).setEmoji(elements.EMOJI_REPEAT).setDisabled(!currentSong), new ButtonBuilder().setCustomId("volume").setStyle(ButtonStyle.Secondary).setEmoji(elements.EMOJI_VOLUME).setDisabled(!currentSong));
    return { content: dashboardContent, embeds: [dashboardEmbed], components: [dashboardButtons] };
  }

  // Get dashboard
  client.getDashboard = async (guild, settings) => {
    const channel = guild.channels.cache.get(settings.flopy1.channel);
    await channel?.messages?.fetch(settings.flopy1.message).then((message) => {
      if (message) client.dashboards.set(guild.id, message);
    }).catch((error) => { });
  }

  // Send dashboard
  client.sendDashboard = (guild, channel, settings, queue, lang) => {
    const dashboard = client.createDashboard(guild, queue, lang);
    client.manageCooldown("leaveVoice", guild.id, 1000);
    client.dashboards.get(guild.id)?.delete().catch((error) => { });
    channel?.send(dashboard).then((message) => {
      if (message) {
        client.dashboards.set(guild.id, message);
        client.updateGuildData(guild, { flopy1: Object.assign(settings.flopy1, { channel: channel.id, message: message.id }) });
      } else client.leaveVoiceChannel(guild);
    }).catch((error) => { });
  }

  // Edit dashboard
  client.editDashboard = (guild, queue, lang) => {
    const dashboard = client.createDashboard(guild, queue, lang);
    client.dashboards.get(guild.id)?.edit(dashboard).catch((error) => { });
  }

  // Manage cooldown
  client.manageCooldown = (name, target, time) => {
    const cooldownId = name + target;
    if (client.cooldowns.has(cooldownId)) return false;
    client.cooldowns.set(cooldownId, true);
    setTimeout(() => client.cooldowns.delete(cooldownId), time);
    return true;
  }

  // Create duration bar
  client.createDurationBar = (queue) => {
    const currentSong = queue.songs[0];
    const progress = Math.min(Math.round((queue.currentTime / currentSong.duration) * client.config.BAR_MAX_DISPLAY), client.config.BAR_MAX_DISPLAY);
    const rest = client.config.BAR_MAX_DISPLAY - progress;
    const bar = new Array(progress).fill(elements.SYMBOL_LINE).concat(elements.SYMBOL_CIRCLE).concat(new Array(rest).fill(" ")).join("");
    return `\`${queue.formattedCurrentTime} ${bar} ${currentSong.formattedDuration}\``;
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
    if (error.includes("Unsupported URL") || error.includes("This url is not supported")) return `${lang.ERROR_URL_UNSUPPORTED}`;
    if (error.includes("Invalid URL")) return `${lang.ERROR_URL_INVALID}`;
    if (error.includes("Unknown Playlist")) return `${lang.ERROR_PLAYLIST_UNKNOWN}`;
    console.warn(error);
    return `${lang.ERROR_UNKNOWN}`;
  }
}