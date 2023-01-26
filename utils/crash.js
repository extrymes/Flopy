module.exports = client => {
    process.on("unhandledRejection", (reason, p) => console.warn(reason, p))
    process.on("uncaughtException", (err, origin) => console.warn(err, origin)) 
    process.on("uncaughtExceptionMonitor", (err, origin) => console.warn(err, origin))
}