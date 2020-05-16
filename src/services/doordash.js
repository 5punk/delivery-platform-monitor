const fetch = require("node-fetch");
const _ = require("lodash");
const m = require("moment");

// const dummyPayload = require("./payloads/doordash.json");
const { opens, closes } = require("../config/hours");
const { doordashId } = require("../config/restaurant");
const { serviceDownMessage } = require("../config/notify");

const logger = require("../utils/logger");
const notify = require("../utils/notify");

const SERVICE = "Doordash";

const checkDoordash = async () => {
  const now = m(m(), "h:mma");
  const openTime = m(opens, "h:mma");
  const closesTime = m(closes, "h:mma");

  try {
    if (openTime.isBefore(now) && now.isBefore(closesTime)) {
      const response = await fetch(
        "https://api-consumer-client.doordash.com/graphql",
        {
          credentials: "include",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:76.0) Gecko/20100101 Firefox/76.0",
            Accept: "*/*",
            "Accept-Language": "en-US",
            "content-type": "application/json",
            "X-Experience-Id": "doordash",
            "X-CSRFToken":
              "yVo74PaWxeVNCz3HQAgm9oPqtsPMZRpnyvMppS0ODrM4C8mQH2pX2leyjzjQfL5P"
          },
          referrer: "https://www.doordash.com",
          body: `{"operationName":"storepageFeed","variables":{"storeId":"${doordashId}","isStorePageFeedMigration":true},"query":"query storepageFeed($storeId: ID!, $menuId: ID) {\\n  storepageFeed(isStorePageFeedMigration: true, storeId: $storeId, menuId: $menuId) {\\n    storeHeader {\\n      id\\n      name\\n      offersDelivery\\n      offersPickup\\n      offersGroupOrder\\n      isConvenience\\n      isDashpassPartner\\n      address {\\n        city\\n        street\\n        displayAddress\\n        __typename\\n      }\\n      deliveryFeeLayout {\\n        title\\n        subtitle\\n        isSurging\\n        displayDeliveryFee\\n        __typename\\n      }\\n      deliveryFeeTooltip {\\n        title\\n        description\\n        __typename\\n      }\\n      coverImgUrl\\n      ratings {\\n        numRatings\\n        averageRating\\n        isNewlyAdded\\n        __typename\\n      }\\n      distanceFromConsumer {\\n        value\\n        label\\n        __typename\\n      }\\n      status {\\n        delivery {\\n          isAvailable\\n          minutes\\n          unavailableStatus\\n          unavailableReason\\n          __typename\\n        }\\n        pickup {\\n          isAvailable\\n          minutes\\n          unavailableStatus\\n          unavailableReason\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    banners {\\n      pickup {\\n        id\\n        title\\n        text\\n        __typename\\n      }\\n      demandGen {\\n        id\\n        title\\n        text\\n        modals {\\n          type\\n          modalKey\\n          modalInfo {\\n            title\\n            description\\n            buttonsList {\\n              text\\n              action\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      demandTest {\\n        id\\n        title\\n        text\\n        modals {\\n          type\\n          modalKey\\n          modalInfo {\\n            title\\n            description\\n            buttonsList {\\n              text\\n              action\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    menuBook {\\n      id\\n      name\\n      displayOpenHours\\n      menuCategories {\\n        id\\n        name\\n        numItems\\n        next {\\n          anchor\\n          cursor\\n          __typename\\n        }\\n        __typename\\n      }\\n      menuList {\\n        id\\n        name\\n        displayOpenHours\\n        __typename\\n      }\\n      __typename\\n    }\\n    itemLists {\\n      id\\n      name\\n      items {\\n        id\\n        name\\n        description\\n        displayPrice\\n        imageUrl\\n        __typename\\n      }\\n      __typename\\n    }\\n    disclaimersList {\\n      id\\n      text\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n"}`,
          method: "POST",
          mode: "cors"
        }
      );

      const parsed = await response.json();

      const available =
        _.get(
          parsed,
          "data.storepageFeed.storeHeader.status.delivery.isAvailable",
          false
        ) &&
        _.get(
          parsed,
          "data.storepageFeed.storeHeader.status.pickup.isAvailable",
          false
        );

      if (available) {
        logger.info("[UP]", `${SERVICE} is up`);
      } else {
        logger.error("[DOWN]", `${SERVICE} is offline`);

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

module.exports = checkDoordash;
