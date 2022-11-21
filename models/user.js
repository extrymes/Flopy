const mongoose = require("mongoose")
const { USER_DEFAULTSETTINGS: defaults } = require("../admin/config")

const userShema = {
    _id: mongoose.Schema.Types.ObjectId,
    userID: String,
    library: {
        "type": Array,
        "default": defaults.library
    }
}

module.exports = mongoose.model("User", userShema)