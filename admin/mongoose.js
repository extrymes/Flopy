const mongoose = require("mongoose")
const config = require("./config")

module.exports = {
    init: () => {
        mongoose.connect(config.DBCONNECTION, {
            autoIndex: config.MONGO_AUTO_INDEX,
            maxPoolSize: config.MONGO_MAX_POOL_SIZE,
            serverSelectionTimeoutMS: config.MONGO_SERVER_SELECTION_TIMEOUT_MS,
            socketTimeoutMS: config.MONGO_SOCKET_TIMEOUT_MS,
            family: config.MONGO_FAMILY,
        }).then(() => console.log("[-] Flopy is connected to the database".green)).catch(error => console.warn(error))
    }
}