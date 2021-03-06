const _ = require("lodash");

const dummyPayload = require("./payloads/grubhub.json");
const { grubhubId } = require("../config/restaurant");
const { serviceDownMessage, consectiveFailure } = require("../config/notify");

const logger = require("../utils/logger");
const notify = require("../utils/notify");
const scrape = require("../utils/scrape");

const SERVICE = "GrubHub";
let debounceCache = [];

const checkGrubhub = async () => {
  if (!grubhubId.length) {
    return null;
  }

  global.track.event("CHECKING", "SERVICE", SERVICE);

  try {
    const restaurantUrl = `https://www.grubhub.com/restaurant/${grubhubId}`;
    const restaurantApiUrl = `https://api-gtm.grubhub.com/restaurants/${grubhubId}?hideChoiceCategories=true`;

    const parsed = await scrape({
      shallowUrl: restaurantUrl,
      apiUrl: restaurantApiUrl
    });

    const available =
      _.get(parsed, "restaurant_availability.open", false) &&
      _.get(parsed, "restaurant_availability.open_delivery", false) &&
      _.get(parsed, "restaurant_availability.open_pickup", false);

    if (available) {
      global.track.event("AVAILABILITY", SERVICE, "UP");
      debounceCache = [];
      logger.info("[UP]", `${SERVICE} is online`);
    } else {
      global.track.event("AVAILABILITY", SERVICE, "DOWN");
      logger.error("[DOWN]", `${SERVICE} is unavailable`);
      debounceCache.push("FAIL");

      if (debounceCache.length === consectiveFailure) {
        global.track.event("NOTIFY", SERVICE, "Max failures reached");

        logger.log(
          "[FAILURES]",
          `${SERVICE} | ${consectiveFailure} failures encountered. Notifying team.`
        );

        notify({
          subject: `${SERVICE} is down`,
          body: serviceDownMessage(SERVICE)
        });

        debounceCache = [];
      }
    }
  } catch (err) {
    const newErr = new Error(
      `[SERVICE] Failed to get ${SERVICE} | ` + err.message
    );
    logger.error(newErr);
    throw newErr;
  }
};

module.exports = checkGrubhub;
