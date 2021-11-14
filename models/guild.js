const mongoose = require("mongoose")
const { GUILD_DEFAULTSETTINGS: defaults } = require("../admin/config")

const guildShema = {
    _id: mongoose.Schema.Types.ObjectId,
    guildID: String,
    prefix: {
        "type": String,
        "default": defaults.prefix
    },
    language: {
        "type": String,
        "default": defaults.language
    },
    dashboardChannel: {
        "type": String,
        "default": defaults.dashboardChannel
    },
    dashboardMessage: {
        "type": String,
        "default": defaults.dashboardMessage
    },
}

module.exports = mongoose.model("Guild", guildShema)