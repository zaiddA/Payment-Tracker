import PaymentRow from "./PaymentRow.jsx";

const PaymentList = ({
  payments,
  highlightPaymentId,
  onRefresh,
  onTriggerRetry,
  onViewRetries,
  onDelete
}) => {
  return (
    <section className="border border-gray-300 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Payment List</h2>
        <span className="text-sm text-gray-600">{payments.length} total</span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                Payment ID
              </th>
              <th className="border border-gray-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                Amount
              </th>
              <th className="border border-gray-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                Status
              </th>
              <th className="border border-gray-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                Retries
              </th>
              <th className="border border-gray-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                Last Reason
              </th>
              <th className="border border-gray-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="border border-gray-200 px-3 py-6 text-center text-sm text-gray-500"
                >
                  No payments created yet.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <PaymentRow
                  key={payment.paymentId}
                  payment={payment}
                  highlight={payment.paymentId === highlightPaymentId}
                  onRefresh={onRefresh}
                  onTriggerRetry={onTriggerRetry}
                  onViewRetries={onViewRetries}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default PaymentList;
