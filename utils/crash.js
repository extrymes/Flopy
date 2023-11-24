module.exports = (client) => {
  process.on("unhandledRejection", (reason, p) => console.warn(reason, p));
  process.on("uncaughtException", (error, origin) => console.warn(error, origin));
  process.on("uncaughtExceptionMonitor", (error, origin) => console.warn(error, origin));
}