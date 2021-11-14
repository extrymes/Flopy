const mongoose = require("mongoose")
const { USER_DEFAULTSETTINGS: defaults } = require("../admin/config")

const userShema = {
    _id: mongoose.Schema.Types.ObjectId,
    userID: String,
    favorite: {
        "type": String,
        "default": defaults.favorite
    }
}

module.exports = mongoose.model("User", userShema)