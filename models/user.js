const mongoose = require("mongoose");

const userShema = {
    userID: String,
    library: {
        "type": Array,
        "default": []
    }
}

module.exports = mongoose.model("User", userShema);