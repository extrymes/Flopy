const mongoose = require("mongoose")
const { USER_DEFAULTSETTINGS: defaults } = require("../admin/config")

const userShema = {
    _id: mongoose.Schema.Types.ObjectId,
    userID: String,
    query: {
        "type": String,
        "default": defaults.query
    }
}

module.exports = mongoose.model("User", userShema)