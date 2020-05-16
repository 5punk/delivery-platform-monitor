const path = require("path");

module.exports = {
  // writes all logs to log folder, ideal for a cronjob
  fsLogger: true,
  logPath: path.resolve("./logs")
};
