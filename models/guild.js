const mongoose = require("mongoose");

const guildSchema = {
  guildID: String,
  flopy1: {
    "type": Object,
    "default": { channel: null, message: null, voice: null, language: "en" }
  },
  flopy2: {
    "type": Object,
    "default": { channel: null, message: null, voice: null, language: "en" }
  },
  flopy3: {
    "type": Object,
    "default": { channel: null, message: null, voice: null, language: "en" }
  }
};

module.exports = mongoose.model("Guild", guildSchema);