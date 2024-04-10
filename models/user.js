const mongoose = require("mongoose");

const userSchema = {
	userID: String,
	library: {
		"type": Array,
		"default": []
	}
};

module.exports = mongoose.model("User", userSchema);
