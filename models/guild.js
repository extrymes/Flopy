const mongoose = require("mongoose")
const { GUILD_DEFAULTSETTINGS: defaults } = require("../admin/config")

const guildShema = {
    _id: mongoose.Schema.Types.ObjectId,
    guildID: String,
    flopy1: {
        "type": Object,
        "default": defaults.flopy1
    },
    flopy2: {
        "type": Object,
        "default": defaults.flopy2
    },
    flopy3: {
        "type": Object,
        "default": defaults.flopy3
    },
}

module.exports = mongoose.model("Guild", guildShema)