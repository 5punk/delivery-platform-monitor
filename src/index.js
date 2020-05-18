const checkUberEats = require("./services/ubereats");
const checkGrubHub = require("./services/grubhub");
const checkDoordash = require("./services/doordash");

const { grubhubId, doordashId, ubereatsId } = require("./config/restaurant");
const { recheckTime } = require("./config/forever");

const logger = require("./utils/logger");

let cycleTimes = 0;

const checkServices = async () => {
  ubereatsId.length > 0 && (await checkUberEats());
  grubhubId.length > 0 && (await checkGrubHub());
  doordashId.length > 0 && (await checkDoordash());
};

const forever = async () => {
  cycleTimes++;
  logger.log("--------");
  logger.log(
    "[DAEMON]",
    `(${cycleTimes})`,
    `${recheckTime}ms up. Re-running script.`
  );
  logger.log("--------");
  global.track.event("INIT", "FOREVER", "Rechecking services");
  await checkServices();
};

const init = async () => {
  const track = await require("./utils/track");
  global.track = track;
  global.track.page("/", "INIT");

  process.env.NODE_ENV === "FOREVER" && setInterval(forever, recheckTime);
  await checkServices();
};

init();
