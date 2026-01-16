const db = require("../config/db");

const insertPayment = async ({ id, idempotencyKey, amount, status }) => {
  const result = await db.query(
    `INSERT INTO payments (id, idempotency_key, amount, status)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (idempotency_key) DO NOTHING
     RETURNING id, idempotency_key, amount, status, created_at, updated_at`,
    [id, idempotencyKey, amount, status]
  );

  return result.rows[0] || null;
};

const getPaymentByIdempotencyKey = async (idempotencyKey) => {
  const result = await db.query(
    `SELECT id, idempotency_key, amount, status, created_at, updated_at
     FROM payments
     WHERE idempotency_key = $1`,
    [idempotencyKey]
  );

  return result.rows[0] || null;
};

const getPaymentById = async (paymentId) => {
  const result = await db.query(
    `SELECT id, idempotency_key, amount, status, created_at, updated_at
     FROM payments
     WHERE id = $1`,
    [paymentId]
  );

  return result.rows[0] || null;
};

const listPayments = async () => {
  const result = await db.query(
    `SELECT p.id,
            p.idempotency_key,
            p.amount,
            p.status,
            p.created_at,
            p.updated_at,
            COALESCE(r.retry_count, 0)::int AS retry_count,
            r.last_retry_reason
     FROM payments p
     LEFT JOIN (
       SELECT payment_id,
              COUNT(*)::int AS retry_count,
              (ARRAY_AGG(reason ORDER BY attempt_no DESC))[1] AS last_retry_reason
       FROM payment_retries
       GROUP BY payment_id
     ) r ON r.payment_id = p.id
     ORDER BY p.created_at DESC`
  );

  return result.rows;
};

const updatePaymentStatus = async (paymentId, status, fromStatus = null) => {
  const params = [paymentId, status];
  const conditions = ["id = $1"];

  if (fromStatus) {
    params.push(fromStatus);
    conditions.push(`status = $${params.length}`);
  }

  const result = await db.query(
    `UPDATE payments
     SET status = $2, updated_at = NOW()
     WHERE ${conditions.join(" AND ")}
     RETURNING id, idempotency_key, amount, status, created_at, updated_at`,
    params
  );

  return result.rows[0] || null;
};

const insertPaymentRetry = async ({ paymentId, attemptNo, reason }) => {
  const result = await db.query(
    `INSERT INTO payment_retries (payment_id, attempt_no, reason)
     VALUES ($1, $2, $3)
     RETURNING id, payment_id, attempt_no, reason, created_at`,
    [paymentId, attemptNo, reason]
  );

  return result.rows[0] || null;
};

const getRetriesByPaymentId = async (paymentId) => {
  const result = await db.query(
    `SELECT id, payment_id, attempt_no, reason, created_at
     FROM payment_retries
     WHERE payment_id = $1
     ORDER BY attempt_no ASC`,
    [paymentId]
  );

  return result.rows;
};

const getRetryCountByPaymentId = async (paymentId) => {
  const result = await db.query(
    `SELECT COALESCE(COUNT(*), 0)::int AS retry_count
     FROM payment_retries
     WHERE payment_id = $1`,
    [paymentId]
  );

  return result.rows[0]?.retry_count || 0;
};

const getProcessingPayments = async () => {
  const result = await db.query(
    `SELECT id, idempotency_key, amount, status, created_at, updated_at
     FROM payments
     WHERE status = 'PROCESSING'
     ORDER BY created_at ASC`
  );

  return result.rows;
};

const deletePaymentById = async (paymentId) => {
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `DELETE FROM payment_retries
       WHERE payment_id = $1`,
      [paymentId]
    );
    const result = await client.query(
      `DELETE FROM payments
       WHERE id = $1
       RETURNING id, idempotency_key, amount, status, created_at, updated_at`,
      [paymentId]
    );
    await client.query("COMMIT");
    return result.rows[0] || null;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  insertPayment,
  getPaymentByIdempotencyKey,
  getPaymentById,
  listPayments,
  updatePaymentStatus,
  insertPaymentRetry,
  getRetriesByPaymentId,
  getRetryCountByPaymentId,
  getProcessingPayments,
  deletePaymentById
};
