const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
};

export const createPayment = async ({ amount, idempotencyKey }) => {
  const response = await fetch(`${API_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey
    },
    body: JSON.stringify({ amount })
  });

  return handleResponse(response);
};

export const listPayments = async () => {
  const response = await fetch(`${API_BASE_URL}/payments`);
  return handleResponse(response);
};

export const getPayment = async (paymentId) => {
  const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`);
  return handleResponse(response);
};

export const triggerRetry = async (paymentId) => {
  const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/retry`, {
    method: "POST"
  });
  return handleResponse(response);
};

export const getRetries = async (paymentId) => {
  const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/retries`);
  return handleResponse(response);
};

export const deletePayment = async (paymentId) => {
  const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
    method: "DELETE"
  });
  return handleResponse(response);
};
