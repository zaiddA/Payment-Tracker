const RetryHistoryModal = ({ isOpen, paymentId, retries, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 p-4">
      <div className="mt-12 w-full max-w-2xl border border-gray-300 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Retry History</h3>
            <p className="mt-1 font-mono text-xs text-gray-700">{paymentId}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-gray-400 px-2 py-1 text-xs"
          >
            Close
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                  Attempt
                </th>
                <th className="border border-gray-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                  Reason
                </th>
                <th className="border border-gray-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody>
              {retries.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="border border-gray-200 px-3 py-6 text-center text-sm text-gray-500"
                  >
                    No retries recorded yet.
                  </td>
                </tr>
              ) : (
                retries.map((retry) => (
                  <tr key={`${paymentId}-${retry.attempt}`}>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      {retry.attempt}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      {retry.reason}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      {new Date(retry.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RetryHistoryModal;
