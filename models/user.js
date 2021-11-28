const mongoose = require("mongoose")
const { USER_DEFAULTSETTINGS: defaults } = require("../admin/config")

const userShema = {
    _id: mongoose.Schema.Types.ObjectId,
    userID: String,
    favorites: {
        "type": Array,
        "default": defaults.favorites
    }
}

module.exports = mongoose.model("User", userShema)