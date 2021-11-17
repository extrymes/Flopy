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
    dashboardChannel1: {
        "type": String,
        "default": defaults.dashboardChannel1
    },
    dashboardMessage1: {
        "type": String,
        "default": defaults.dashboardMessage1
    },
    dashboardChannel2: {
        "type": String,
        "default": defaults.dashboardChannel2
    },
    dashboardMessage2: {
        "type": String,
        "default": defaults.dashboardMessage2
    },
    dashboardChannel3: {
        "type": String,
        "default": defaults.dashboardChannel3
    },
    dashboardMessage3: {
        "type": String,
        "default": defaults.dashboardMessage3
    },
}

module.exports = mongoose.model("Guild", guildShema)