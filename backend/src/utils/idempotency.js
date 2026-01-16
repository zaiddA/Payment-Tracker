const getIdempotencyKey = (req) => {
  const rawKey = req.header("Idempotency-Key") || req.header("idempotency-key");

  if (!rawKey || !rawKey.trim()) {
    const error = new Error("Idempotency-Key header is required");
    error.statusCode = 400;
    throw error;
  }

  return rawKey.trim();
};

module.exports = { getIdempotencyKey };
