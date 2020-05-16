const checkUberEats = require("./services/ubereats");
const checkGrubHub = require("./services/grubhub");
const checkDoordash = require("./services/doordash");

const { grubhubId, doordashId, ubereatsId } = require("./config/restaurant");
const { recheckTime } = require("./config/forever");

const logger = require("./utils/logger");

let cycleTimes = 0;

const main = async () => {
  ubereatsId.length && (await checkUberEats());
  grubhubId.length && (await checkGrubHub());
  doordashId.length && (await checkDoordash());
};

const forever = async () => {
  cycleTimes++;
  logger.log("--------");
  logger.log("[DAEMON]", cycleTimes, "Re-running script");
  logger.log("--------");
  await main();
};

process.env.NODE_ENV === "FOREVER" && setInterval(forever, recheckTime);
main();
