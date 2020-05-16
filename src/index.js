const checkUberEats = require("./services/ubereats");
const checkGrubHub = require("./services/grubhub");
const checkDoordash = require("./services/doordash");

const main = async () => {
  await checkUberEats();
  await checkGrubHub();
  await checkDoordash();
};

main();
