const fetch = require("node-fetch");
const _ = require("lodash");
const m = require("moment");

// const dummyPayload = require("./payloads/ubereats.json");
const { opens, closes } = require("../config/hours");
const { ubereatsId } = require("../config/restaurant");
const { serviceDownMessage } = require("../config/notify");

const logger = require("../utils/logger");
const notify = require("../utils/notify");

const SERVICE = "Uber Eats";

const checkUberEats = async () => {
  const now = m(m(), "h:mma");
  const openTime = m(opens, "h:mma");
  const closesTime = m(closes, "h:mma");

  try {
    if (openTime.isBefore(now) && now.isBefore(closesTime)) {
      const response = await fetch("https://www.ubereats.com/api/getStoreV1", {
        credentials: "include",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:76.0) Gecko/20100101 Firefox/76.0",
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.5",
          "Content-Type": "application/json",
          "x-csrf-token": "x"
        },
        referrer: "https://www.ubereats.com/",
        body: `{"storeUuid":"${ubereatsId}","sfNuggetCount":2}`,
        method: "POST",
        mode: "cors"
      });

      const parsed = await response.json();

      const available =
        _.get(parsed, "data.isOpen", false) &&
        _.get(parsed, "data.supportedDiningModes", []).filter(
          e => e.mode === "DELIVERY" && e.isAvailable
        );

      if (available.length === 1) {
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

module.exports = checkUberEats;
