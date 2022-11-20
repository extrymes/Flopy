const { DBCONNECTION } = require("./config")
const mongoose = require("mongoose")

module.exports = {
    init: () => {
        const mongOptions = {
            autoIndex: false, // Don't build indexes
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4 // Use IPv4, skip trying IPv6
        }

        mongoose.connect(DBCONNECTION, mongOptions)
        mongoose.Promise = global.Promise
        mongoose.connection.on("connected", () => console.log("[-] Flopy is connected to the database".green))
    }
}