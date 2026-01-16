import { useState } from "react";
import { createPayment } from "../api/payments.api.js";

const CreatePayment = ({ onCreated }) => {
  const [amount, setAmount] = useState(499);
  const [idempotencyKey, setIdempotencyKey] = useState("demo-key-001");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payment = await createPayment({
        amount: Number(amount),
        idempotencyKey
      });
      setResult(payment);
      onCreated(payment);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="border border-gray-300 p-6">
      <h2 className="text-lg font-semibold">Create Payment</h2>
      <p className="mt-1 text-sm text-gray-600">
        Use the same idempotency key twice to prove the same payment ID.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Amount
          <input
            type="number"
            min="1"
            className="mt-1 w-full border border-gray-300 px-3 py-2"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
        </label>

        <label className="block text-sm font-medium text-gray-700">
          Idempotency Key
          <input
            type="text"
            className="mt-1 w-full border border-gray-300 px-3 py-2"
            value={idempotencyKey}
            onChange={(event) => setIdempotencyKey(event.target.value)}
            required
          />
        </label>

        <button
          type="submit"
          className="w-full border border-gray-900 bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
          disabled={submitting}
        >
          {submitting ? "Creating..." : "Create Payment"}
        </button>
      </form>

      {error ? (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      ) : null}

      {result ? (
        <div className="mt-4 border border-gray-200 p-3 text-sm">
          <p className="font-semibold">Last Response</p>
          <p className="mt-1 font-mono text-xs text-gray-800">
            {result.paymentId}
          </p>
          <p className="mt-1 text-gray-700">Status: {result.status}</p>
        </div>
      ) : null}
    </section>
  );
};

export default CreatePayment;
