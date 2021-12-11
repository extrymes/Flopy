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
    dashboard1: {
        "type": Object,
        "default": defaults.dashboard1
    },
    dashboard2: {
        "type": Object,
        "default": defaults.dashboard2
    },
    dashboard3: {
        "type": Object,
        "default": defaults.dashboard3
    },
}

module.exports = mongoose.model("Guild", guildShema)