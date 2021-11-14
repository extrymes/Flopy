const Discord = require("discord.js")

module.exports = async (client, interaction) => {
    const guild = interaction.guild
    const settings = await client.getGuild(guild)
    const lang = require(`../util/lang/${settings.language}`)
    const user = interaction.user
    const clientChannel = guild.members.cache.get(client.user.id).voice.channel
    const memberChannel = interaction.member.voice.channel

    eval(interaction.customId)

    async function Lang(langID) {
        await client.updateGuild(guild, { language: langID })
        client.updateDashboard(guild)
        interaction?.deferUpdate().catch(error => {})
    }

    async function PlayPause() {
        if(clientChannel?.id === memberChannel?.id) {
            client.musicPlayPause(guild)
            interaction?.deferUpdate().catch(error => {})
        } else client.replyRed(interaction, `${lang.USER_NO_CORRECT_VOICE_CHANNEL}`)
    }

    async function Stop() {
        if(clientChannel?.id === memberChannel?.id) {
            client.musicStop(guild)
            interaction?.deferUpdate().catch(error => {})
        } else client.replyRed(interaction, `${lang.USER_NO_CORRECT_VOICE_CHANNEL}`)
    }

    async function Skip() {
        if(clientChannel?.id === memberChannel?.id) {
            client.musicSkip(guild)
            interaction?.deferUpdate().catch(error => {})
        } else client.replyRed(interaction, `${lang.USER_NO_CORRECT_VOICE_CHANNEL}`)
    }

    async function Repeat() {
        if(clientChannel?.id === memberChannel?.id) {
            client.musicRepeat(guild)
            interaction?.deferUpdate().catch(error => {})
        } else client.replyRed(interaction, `${lang.USER_NO_CORRECT_VOICE_CHANNEL}`)
    }

    async function Shuffle() {
        if(clientChannel?.id === memberChannel?.id) {
            client.musicShuffle(guild)
            interaction?.deferUpdate().catch(error => {})
        } else client.replyRed(interaction, `${lang.USER_NO_CORRECT_VOICE_CHANNEL}`)
    }

    async function Volume() {
        if(clientChannel?.id === memberChannel?.id) {
            client.musicVolume(guild)
            interaction?.deferUpdate().catch(error => {})
        } else client.replyRed(interaction, `${lang.USER_NO_CORRECT_VOICE_CHANNEL}`)
    }

    async function Progress() {
        client.musicProgress(guild, interaction)
    }

    async function Favorite() {
        if(memberChannel) {
            const queue = client.player.getQueue(guild.id)

            if(queue?.nowPlaying) {
                client.musicFavorite(guild, interaction, user, queue?.nowPlaying?.url)
            } else {
                const userData = await client.getUser(user)
                if(userData) {
                    client.musicPlay(guild, memberChannel, userData.favorite)
                    interaction?.deferUpdate().catch(error => {})
                } else client.replyRed(interaction, `${lang.FAVORITE_NO}`)
            }
        } else client.replyRed(interaction, `${lang.USER_NO_VOICE_CHANNEL}`)
    }
}