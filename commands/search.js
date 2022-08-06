const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder } = require("discord.js")

module.exports.run = async (client, interaction, settings, queue, lang) => {
    const { guild, member, options } = interaction
    const name = options.getString("name")

    if(!member.voice.channel) return client.replyError(interaction, false, `${lang.ERROR_USER_NO_VOICE}`)
    if(!client.checkVoice(guild, member) && queue) return client.replyError(interaction, false, `${lang.ERROR_USER_NO_VOICE_2}`)
    if(client.cooldown("search" + member.id, 10000)) return client.replyError(interaction, false, `${lang.ERROR_ACTION_TOO_FAST}`)
    await interaction.deferReply()
    const songs = await client.distube.search(name).catch(error => {
        const errorMessage = client.getErrorMessage(error.message, lang)
        client.replyError(interaction, true, `${errorMessage}`)
    })
    if(!songs[0]) return
    const results = songs.map((item, i) => { return { label: `${i + 1}. ${item.name.length <= client.config.SONG_MAX_LENGTH ? item.name : item.name.substring(0, client.config.SONG_MAX_LENGTH) + "..."}`, value: item.url } })
    const searchEmbed = new EmbedBuilder().setAuthor({ name: `${songs[0].name}`, url: songs[0].url, iconURL: client.elements.ICON_FLOPY }).setThumbnail(songs[0].thumbnail || client.elements.BANNER_SECONDARY).addFields({ name: `**${lang.MESSAGE_SONG_AUTHOR}**`, value: `${songs[0].uploader.name}`, inline: true }, { name: `**${lang.MESSAGE_SONG_VIEWS}**`, value: `${songs[0].views.toString().replace(/(.)(?=(\d{3})+$)/g,"$1,")}`, inline: true }).setColor(client.elements.COLOR_FLOPY)
    const resultsMenu = new ActionRowBuilder().addComponents(new SelectMenuBuilder().setCustomId("play").setOptions(results))
    interaction.editReply({ embeds: [searchEmbed], components: [resultsMenu] }).catch(error => {}).catch(error => {})
    setTimeout(() => interaction.deleteReply().catch(error => {}), 10000)
}
module.exports.data = {
    name: "search",
    description: languages["en"].COMMAND_SEARCH_DESCRIPTION,
    description_localizations: { "fr": languages["fr"].COMMAND_SEARCH_DESCRIPTION },
    options: [
        {
            name: "name",
            description: languages["en"].COMMAND_SEARCH_DESCRIPTION,
            description_localizations: { "fr": languages["fr"].COMMAND_SEARCH_DESCRIPTION },
            type: 3,
            required: true,
        },
    ],
    dm_permission: false,
}