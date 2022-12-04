const mongoose = require("mongoose")
const { USER_DEFAULT_SETTINGS: defaults } = require("../admin/config")

const userShema = {
    userID: String,
    library: {
        "type": Array,
        "default": defaults.library
    }
}

module.exports = mongoose.model("User", userShema)