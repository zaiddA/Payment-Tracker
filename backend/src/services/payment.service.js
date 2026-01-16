const { v4: uuidv4 } = require("uuid");
const paymentRepo = require("../repositories/payment.repo");
const {
  PAYMENT_STATUS,
  assertTransitionAllowed
} = require("../config/constants");

const createPayment = async ({ amount, idempotencyKey }) => {
  const inserted = await paymentRepo.insertPayment({
    id: uuidv4(),
    idempotencyKey,
    amount,
    status: PAYMENT_STATUS.CREATED
  });

  if (!inserted) {
    const existing = await paymentRepo.getPaymentByIdempotencyKey(idempotencyKey);
    if (!existing) {
      const error = new Error("Unable to resolve idempotent payment");
      error.statusCode = 500;
      throw error;
    }
    return { payment: existing, created: false };
  }

  console.log(`Payment created: ${inserted.id}`);

  assertTransitionAllowed(PAYMENT_STATUS.CREATED, PAYMENT_STATUS.PROCESSING);
  const processing = await paymentRepo.updatePaymentStatus(
    inserted.id,
    PAYMENT_STATUS.PROCESSING,
    PAYMENT_STATUS.CREATED
  );

  if (!processing) {
    const error = new Error("Payment state transition blocked");
    error.statusCode = 409;
    throw error;
  }

  console.log(
    `Payment status transition: ${inserted.id} ${PAYMENT_STATUS.CREATED} -> ${PAYMENT_STATUS.PROCESSING}`
  );

  return { payment: processing, created: true };
};

const getPaymentById = async (paymentId) => {
  const payment = await paymentRepo.getPaymentById(paymentId);
  if (!payment) {
    const error = new Error("Payment not found");
    error.statusCode = 404;
    throw error;
  }
  return payment;
};

const listPayments = async () => paymentRepo.listPayments();

const getRetries = async (paymentId) => {
  await getPaymentById(paymentId);
  return paymentRepo.getRetriesByPaymentId(paymentId);
};

const deletePayment = async (paymentId) => {
  const deleted = await paymentRepo.deletePaymentById(paymentId);
  if (!deleted) {
    const error = new Error("Payment not found");
    error.statusCode = 404;
    throw error;
  }
  return deleted;
};

module.exports = {
  createPayment,
  getPaymentById,
  listPayments,
  getRetries,
  deletePayment
};
