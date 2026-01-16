const PAYMENT_STATUS = {
  CREATED: "CREATED",
  PROCESSING: "PROCESSING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED"
};

const TERMINAL_STATUSES = new Set([PAYMENT_STATUS.SUCCESS, PAYMENT_STATUS.FAILED]);

const ALLOWED_TRANSITIONS = {
  [PAYMENT_STATUS.CREATED]: new Set([PAYMENT_STATUS.PROCESSING]),
  [PAYMENT_STATUS.PROCESSING]: new Set([
    PAYMENT_STATUS.SUCCESS,
    PAYMENT_STATUS.FAILED
  ]),
  [PAYMENT_STATUS.SUCCESS]: new Set(),
  [PAYMENT_STATUS.FAILED]: new Set()
};

const isTransitionAllowed = (fromStatus, toStatus) =>
  ALLOWED_TRANSITIONS[fromStatus]?.has(toStatus) || false;

const assertTransitionAllowed = (fromStatus, toStatus) => {
  if (!isTransitionAllowed(fromStatus, toStatus)) {
    const error = new Error(`Illegal transition: ${fromStatus} -> ${toStatus}`);
    error.statusCode = 409;
    throw error;
  }
};

const RETRY_INTERVAL_SECONDS = Number.parseInt(process.env.RETRY_INTERVAL_SECONDS, 10) || 30;
const MAX_RETRY_ATTEMPTS = Number.parseInt(process.env.MAX_RETRY_ATTEMPTS, 10) || 3;

module.exports = {
  PAYMENT_STATUS,
  TERMINAL_STATUSES,
  ALLOWED_TRANSITIONS,
  isTransitionAllowed,
  assertTransitionAllowed,
  RETRY_INTERVAL_SECONDS,
  MAX_RETRY_ATTEMPTS
};
