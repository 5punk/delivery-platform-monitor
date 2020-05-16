const puppeteer = require("puppeteer-extra");
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

const logger = require("./logger");

puppeteer.use(StealthPlugin());

const scrape = async ({ shallowUrl, apiUrl }) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // set user agent (override the default headless User Agent)
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  );

  logger.log("[SCRAPING]", "API url", apiUrl);

  await page.goto(shallowUrl);

  const finalResponse = await page.waitForResponse(
    response => response.url().includes(apiUrl),
    11
  );

  const finalJson = await finalResponse.json();

  await browser.close();

  return finalJson;
};

module.exports = scrape;
