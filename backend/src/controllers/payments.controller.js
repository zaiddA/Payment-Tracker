const paymentService = require("../services/payment.service");
const retryService = require("../services/retry.service");
const { getIdempotencyKey } = require("../utils/idempotency");
const { MAX_RETRY_ATTEMPTS } = require("../config/constants");

const handleError = (res, error) => {
  const status = error.statusCode || 500;
  res.status(status).json({ error: error.message || "Unexpected error" });
};

const createPayment = async (req, res) => {
  try {
    const idempotencyKey = getIdempotencyKey(req);
    const { amount } = req.body || {};

    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({ error: "Amount must be a positive integer" });
    }

    const { payment, created } = await paymentService.createPayment({
      amount,
      idempotencyKey
    });

    res.status(created ? 201 : 200).json({
      paymentId: payment.id,
      amount: payment.amount,
      status: payment.status
    });
  } catch (error) {
    handleError(res, error);
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);

    res.json({
      paymentId: payment.id,
      amount: payment.amount,
      status: payment.status
    });
  } catch (error) {
    handleError(res, error);
  }
};

const listPayments = async (req, res) => {
  try {
    const payments = await paymentService.listPayments();

    res.json(
      payments.map((payment) => ({
        paymentId: payment.id,
        amount: payment.amount,
        status: payment.status,
        retryCount: payment.retry_count,
        maxRetryAttempts: MAX_RETRY_ATTEMPTS,
        lastRetryReason: payment.last_retry_reason
      }))
    );
  } catch (error) {
    handleError(res, error);
  }
};

const triggerRetry = async (req, res) => {
  try {
    const result = await retryService.retryPaymentById(req.params.id, "MANUAL");

    res.json({
      paymentId: result.payment.id,
      amount: result.payment.amount,
      status: result.payment.status,
      outcome: result.outcome,
      attemptNo: result.attemptNo
    });
  } catch (error) {
    handleError(res, error);
  }
};

const getRetries = async (req, res) => {
  try {
    const retries = await paymentService.getRetries(req.params.id);

    res.json(
      retries.map((retry) => ({
        attempt: retry.attempt_no,
        reason: retry.reason,
        timestamp: retry.created_at
      }))
    );
  } catch (error) {
    handleError(res, error);
  }
};

const deletePayment = async (req, res) => {
  try {
    const payment = await paymentService.deletePayment(req.params.id);
    res.json({
      paymentId: payment.id,
      status: payment.status
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createPayment,
  getPaymentStatus,
  listPayments,
  triggerRetry,
  getRetries,
  deletePayment
};
