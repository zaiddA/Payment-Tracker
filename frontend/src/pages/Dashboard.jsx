import { useEffect, useState } from "react";
import {
  listPayments,
  getPayment,
  triggerRetry,
  getRetries,
  deletePayment
} from "../api/payments.api.js";
import CreatePayment from "../components/CreatePayment.jsx";
import PaymentList from "../components/PaymentList.jsx";
import RetryHistoryModal from "../components/RetryHistoryModal.jsx";

const Dashboard = () => {
  const AUTO_REFRESH_MS = 5000;
  const [payments, setPayments] = useState([]);
  const [highlightPaymentId, setHighlightPaymentId] = useState(null);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPaymentId, setModalPaymentId] = useState("");
  const [modalRetries, setModalRetries] = useState([]);

  const loadPayments = async () => {
    setError("");
    try {
      const data = await listPayments();
      setPayments(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadPayments();
    const intervalId = setInterval(() => {
      loadPayments();
    }, AUTO_REFRESH_MS);

    return () => clearInterval(intervalId);
  }, []);

  const handleCreated = (payment) => {
    setHighlightPaymentId(payment.paymentId);
    loadPayments();
  };

  const handleRefresh = async (paymentId) => {
    setError("");
    try {
      const payment = await getPayment(paymentId);
      setPayments((prev) =>
        prev.map((item) =>
          item.paymentId === paymentId
            ? { ...item, ...payment }
            : item
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTriggerRetry = async (paymentId) => {
    setError("");
    try {
      await triggerRetry(paymentId);
      await loadPayments();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewRetries = async (paymentId) => {
    setError("");
    try {
      const retries = await getRetries(paymentId);
      setModalPaymentId(paymentId);
      setModalRetries(retries);
      setModalOpen(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (paymentId) => {
    setError("");
    const confirmed = window.confirm("Delete this payment and its retry history?");
    if (!confirmed) {
      return;
    }

    try {
      await deletePayment(paymentId);
      setPayments((prev) =>
        prev.filter((payment) => payment.paymentId !== paymentId)
      );
      if (highlightPaymentId === paymentId) {
        setHighlightPaymentId(null);
      }
      if (modalPaymentId === paymentId) {
        handleCloseModal();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalPaymentId("");
    setModalRetries([]);
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="border border-gray-300 p-6">
          <h1 className="text-2xl font-semibold">Payment Status Debug Panel</h1>
          <p className="mt-2 text-sm text-gray-600">
            Visualizing retries and state transitions in a failure-prone system.
          </p>
        </header>

        {error ? (
          <div className="border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <CreatePayment onCreated={handleCreated} />
          <PaymentList
            payments={payments}
            highlightPaymentId={highlightPaymentId}
            onRefresh={handleRefresh}
            onTriggerRetry={handleTriggerRetry}
            onViewRetries={handleViewRetries}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <RetryHistoryModal
        isOpen={modalOpen}
        paymentId={modalPaymentId}
        retries={modalRetries}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Dashboard;
