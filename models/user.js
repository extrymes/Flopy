const mongoose = require("mongoose")
const { USER_DEFAULTSETTINGS: defaults } = require("../admin/config")

const userShema = {
    _id: mongoose.Schema.Types.ObjectId,
    userID: String,
    playlist: {
        "type": Array,
        "default": defaults.playlist
    }
}

module.exports = mongoose.model("User", userShema)