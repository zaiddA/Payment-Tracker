const STATUS_STYLES = {
  CREATED: "bg-gray-200 text-gray-800",
  PROCESSING: "bg-yellow-200 text-yellow-900",
  SUCCESS: "bg-green-200 text-green-900",
  FAILED: "bg-red-200 text-red-900"
};

const PaymentRow = ({
  payment,
  highlight,
  onRefresh,
  onTriggerRetry,
  onViewRetries,
  onDelete
}) => {
  const statusStyle = STATUS_STYLES[payment.status] || "bg-gray-200 text-gray-800";
  const retryCount = payment.retryCount ?? 0;
  const retryLimit = payment.maxRetryAttempts ?? "-";
  const lastReason = payment.lastRetryReason || "N/A";

  return (
    <tr className={highlight ? "bg-yellow-50" : "bg-white"}>
      <td className="border border-gray-200 px-3 py-2 font-mono text-xs">
        {payment.paymentId}
      </td>
      <td className="border border-gray-200 px-3 py-2 text-sm">
        {payment.amount}
      </td>
      <td className="border border-gray-200 px-3 py-2 text-sm">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold ${statusStyle}`}>
          {payment.status}
        </span>
      </td>
      <td className="border border-gray-200 px-3 py-2 text-sm">
        Retries: {retryCount} / {retryLimit}
      </td>
      <td className="border border-gray-200 px-3 py-2 text-sm">
        {lastReason}
      </td>
      <td className="border border-gray-200 px-3 py-2 text-sm">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="border border-gray-400 px-2 py-1 text-xs"
            onClick={() => onRefresh(payment.paymentId)}
          >
            Refresh Status
          </button>
          <button
            type="button"
            className="border border-gray-400 px-2 py-1 text-xs"
            onClick={() => onTriggerRetry(payment.paymentId)}
          >
            Trigger Retry
          </button>
          <button
            type="button"
            className="border border-gray-400 px-2 py-1 text-xs"
            onClick={() => onViewRetries(payment.paymentId)}
          >
            View Retries
          </button>
          <button
            type="button"
            className="border border-red-500 px-2 py-1 text-xs text-red-600"
            onClick={() => onDelete(payment.paymentId)}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default PaymentRow;
