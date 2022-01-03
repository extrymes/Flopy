const mongoose = require("mongoose")
const { USER_DEFAULTSETTINGS: defaults } = require("../admin/config")

const userShema = {
    _id: mongoose.Schema.Types.ObjectId,
    userID: String,
    saved: {
        "type": String,
        "default": defaults.saved
    }
}

module.exports = mongoose.model("User", userShema)