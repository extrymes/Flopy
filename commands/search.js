const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js")
const elements = require("../util/elements")
const languages = require("../util/languages")

module.exports.run = async (client, interaction, settings, queue, lang) => {
    const { member, options } = interaction
    const name = options.getString("name")

    if(client.cooldown("search" + member.id, 4000)) return client.replyError(interaction, false, `${lang.ERROR_ACTION_NOT_POSSIBLE}`)
    await interaction.deferReply({ ephemeral: true }).catch(error => {})
    const songs = await client.distube.search(name).catch(error => {
        const errorMessage = client.getErrorMessage(error.message, lang)
        client.replyError(interaction, true, `${errorMessage}`)
    })
    if(!songs) return
    const items = songs.map((item, i) => { return { label: `${i + 1}. ${item.name.length <= client.config.SONG_MAX_LENGTH ? item.name : item.name.substring(0, client.config.SONG_MAX_LENGTH) + "..."}`, value: item.url } })
    const searchEmbed = new EmbedBuilder().setAuthor({ name: `${songs[0].name}`, url: songs[0].url, iconURL: elements.ICON_FLOPY }).setThumbnail(songs[0].thumbnail || elements.BANNER_SECONDARY).addFields({ name: `**${lang.MESSAGE_SONG_AUTHOR}**`, value: `${songs[0].uploader.name}`, inline: true }, { name: `**${lang.MESSAGE_SONG_VIEWS}**`, value: `${songs[0].views.toString().replace(/(.)(?=(\d{3})+$)/g,"$1,")}`, inline: true }).setColor(elements.COLOR_FLOPY)
    const searchMenu = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("play").setOptions(items))
    interaction.editReply({ embeds: [searchEmbed], components: [searchMenu], ephemeral: true }).catch(error => {})
    setTimeout(() => interaction.deleteReply().catch(error => {}), 60000)
}
module.exports.data = {
    name: "search",
    description: languages["en"].COMMAND_SEARCH_DESCRIPTION,
    description_localizations: { "fr": languages["fr"].COMMAND_SEARCH_DESCRIPTION },
    options: [
        {
            name: "name",
            description: languages["en"].COMMAND_SEARCH_OPTION,
            description_localizations: { "fr": languages["fr"].COMMAND_SEARCH_OPTION },
            type: 3,
            required: true,
        },
    ],
    dm_permission: false,
}