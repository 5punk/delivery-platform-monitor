const fetch = require("node-fetch");
const _ = require("lodash");
const m = require("moment");

// const dummyPayload = require("./payloads/grubhub.json");
const { opens, closes } = require("../config/hours");
const { grubhubId } = require("../config/restaurant");
const { serviceDownMessage } = require("../config/notify");

const logger = require("../utils/logger");
const notify = require("../utils/notify");
const scrape = require("../utils/scrape");

const SERVICE = "GrubHub";

const checkGrubhub = async () => {
  const now = m(m(), "h:mma");
  const openTime = m(opens, "h:mma");
  const closesTime = m(closes, "h:mma");

  try {
    if (openTime.isBefore(now) && now.isBefore(closesTime)) {
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
        logger.info("[UP]", `${SERVICE} is online`);
      } else {
        logger.error("[DOWN]", `${SERVICE} is unavailable`);

        notify({
          subject: `${SERVICE} is down`,
          body: serviceDownMessage(SERVICE)
        });
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
