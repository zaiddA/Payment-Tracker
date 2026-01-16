const { RETRY_INTERVAL_SECONDS } = require("../config/constants");
const { retryProcessingPayments } = require("../services/retry.service");

const startRetryWorker = () => {
  const intervalMs = RETRY_INTERVAL_SECONDS * 1000;
  let running = false;

  console.log(`Retry worker running every ${RETRY_INTERVAL_SECONDS}s`);

  const tick = async () => {
    if (running) {
      return;
    }

    running = true;

    try {
      const results = await retryProcessingPayments();
      const processed = results.filter((result) => !result.skipped).length;
      if (processed > 0) {
        console.log(`Retry worker processed ${processed} payment(s)`);
      }
    } catch (error) {
      console.error("Retry worker error", error);
    } finally {
      running = false;
    }
  };

  setInterval(tick, intervalMs);
};

module.exports = { startRetryWorker };
