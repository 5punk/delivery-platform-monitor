const ua = require("universal-analytics");
const fetch = require("node-fetch");
const fs = require("fs");
const si = require("systeminformation");

const trackConfig = require("../config/track");
const logger = require("./logger");

const trackingIdUrl =
  "https://raw.githubusercontent.com/5punk/food-service-monitor/analytics/tracking.json";

const readUserId = async () => {
  try {
    return await fs.readFileSync(".user").toString();
  } catch (err) {}
};
const writeUserId = async id => await fs.writeFileSync(".user", id);

const adapter = visitor => ({
  page: (page, phase) =>
    trackConfig.optIn && visitor.pageview(page, null, phase).send(),
  event: (category, action, label, value) =>
    trackConfig.optIn && visitor.event(category, action, label, value).send(),
  error: msg => visitor.exception(msg).send()
});

const initPings = async visitor => {
  const systemInfo = JSON.stringify(await si.osInfo());
  visitor.event("SYSTEM", "INFO", systemInfo);
};

const init = async () => {
  if (!trackConfig.optIn) {
    return;
  }

  try {
    const response = await fetch(trackingIdUrl);
    const uid = await response.json();
    if (!uid && !uid.id) {
      throw new Error("Analytics ID can't be parsed. Got: " + uid);
    }
    const userId = await readUserId();

    // logger.log("[ANALYTICS]", "Got ID", uid.id);
    const visitor = userId ? ua(uid.id, userId) : ua(uid.id);
    visitor.set("uid", visitor.cid);

    !userId && (await writeUserId(visitor.cid));

    const tracker = adapter(visitor);

    await initPings(tracker);

    return tracker;
  } catch (err) {
    const newErr = new Error(
      `[ANALYTICS] Failed to get Analytics ID | ` + err.message
    );
    logger.error(newErr);
  }
};

// run by default
module.exports = (async () => await init())();
