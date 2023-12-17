const mongoose = require("mongoose");

const guildSchema = {
  guildID: String,
  flopy1: {
    "type": Object,
    "default": { channel: "", message: "", voice: "", language: "en" }
  },
  flopy2: {
    "type": Object,
    "default": { channel: "", message: "", voice: "", language: "en" }
  },
  flopy3: {
    "type": Object,
    "default": { channel: "", message: "", voice: "", language: "en" }
  }
};

module.exports = mongoose.model("Guild", guildSchema);