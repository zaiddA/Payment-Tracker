const paymentRepo = require("../repositories/payment.repo");
const { simulateFailure } = require("../utils/failureSimulator");
const {
  PAYMENT_STATUS,
  MAX_RETRY_ATTEMPTS,
  assertTransitionAllowed
} = require("../config/constants");

const resolveAttemptsByPayment = new Map();

const getResolveAttempt = (paymentId) => {
  if (!resolveAttemptsByPayment.has(paymentId)) {
    const attempt = Math.floor(Math.random() * MAX_RETRY_ATTEMPTS) + 1;
    resolveAttemptsByPayment.set(paymentId, attempt);
  }

  return resolveAttemptsByPayment.get(paymentId);
};

const retryPayment = async (payment, source, { throwOnSkip } = {}) => {
  if (payment.status !== PAYMENT_STATUS.PROCESSING) {
    if (throwOnSkip) {
      const error = new Error("Only PROCESSING payments can be retried");
      error.statusCode = 409;
      throw error;
    }

    return { skipped: true, reason: "NOT_PROCESSING", payment };
  }

  const retryCount = await paymentRepo.getRetryCountByPaymentId(payment.id);

  if (retryCount >= MAX_RETRY_ATTEMPTS) {
    if (throwOnSkip) {
      const error = new Error("Max retry attempts reached");
      error.statusCode = 409;
      throw error;
    }

    return { skipped: true, reason: "MAX_RETRIES", payment };
  }

  const attemptNo = retryCount + 1;
  const resolveAttempt = getResolveAttempt(payment.id);
  let outcome = simulateFailure();

  if (attemptNo < resolveAttempt) {
    outcome = "TIMEOUT";
  } else {
    while (outcome === "TIMEOUT") {
      outcome = simulateFailure();
    }
  }

  await paymentRepo.insertPaymentRetry({
    paymentId: payment.id,
    attemptNo,
    reason: outcome
  });

  console.log(`Retry attempt ${attemptNo} for ${payment.id} (${source}): ${outcome}`);

  let updatedPayment = payment;

  if (outcome === "SUCCESS") {
    assertTransitionAllowed(payment.status, PAYMENT_STATUS.SUCCESS);
    updatedPayment = await paymentRepo.updatePaymentStatus(
      payment.id,
      PAYMENT_STATUS.SUCCESS,
      PAYMENT_STATUS.PROCESSING
    );
    if (!updatedPayment) {
      const error = new Error("Payment state transition blocked");
      error.statusCode = 409;
      if (throwOnSkip) {
        throw error;
      }
      return { skipped: true, reason: "STATE_CHANGED", payment };
    }
    resolveAttemptsByPayment.delete(payment.id);
    console.log(
      `Payment status transition: ${payment.id} ${PAYMENT_STATUS.PROCESSING} -> ${PAYMENT_STATUS.SUCCESS}`
    );
  } else if (outcome === "FAILED") {
    assertTransitionAllowed(payment.status, PAYMENT_STATUS.FAILED);
    updatedPayment = await paymentRepo.updatePaymentStatus(
      payment.id,
      PAYMENT_STATUS.FAILED,
      PAYMENT_STATUS.PROCESSING
    );
    if (!updatedPayment) {
      const error = new Error("Payment state transition blocked");
      error.statusCode = 409;
      if (throwOnSkip) {
        throw error;
      }
      return { skipped: true, reason: "STATE_CHANGED", payment };
    }
    resolveAttemptsByPayment.delete(payment.id);
    console.log(
      `Payment status transition: ${payment.id} ${PAYMENT_STATUS.PROCESSING} -> ${PAYMENT_STATUS.FAILED}`
    );
  }

  return {
    payment: updatedPayment,
    outcome,
    attemptNo
  };
};

const retryPaymentById = async (paymentId, source = "MANUAL") => {
  const payment = await paymentRepo.getPaymentById(paymentId);
  if (!payment) {
    const error = new Error("Payment not found");
    error.statusCode = 404;
    throw error;
  }

  return retryPayment(payment, source, { throwOnSkip: true });
};

const retryProcessingPayments = async () => {
  const payments = await paymentRepo.getProcessingPayments();
  const results = [];

  for (const payment of payments) {
    const result = await retryPayment(payment, "WORKER", { throwOnSkip: false });
    results.push(result);
  }

  return results;
};

module.exports = {
  retryPaymentById,
  retryProcessingPayments
};
