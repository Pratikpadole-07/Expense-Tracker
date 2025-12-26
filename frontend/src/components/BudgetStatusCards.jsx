import { useEffect, useState } from "react";
import api from "../api/api";

const BudgetStatusCards = ({ refreshKey }) => {
  const [budgets, setBudgets] = useState([]);

  const month = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    api
      .get(`/budgets/status?month=${month}`)
      .then(res => setBudgets(res.data))
      .catch(() => setBudgets([]));
  }, [refreshKey, month]);

  if (!budgets.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {budgets.map(b => {
        const remaining = b.limit - b.spent;

        const statusStyles =
          b.percentUsed >= 100
            ? "border-red-500 bg-red-50 animate-shake shadow-red-200"
            : b.percentUsed >= 80
            ? "border-yellow-400 bg-yellow-50 animate-pulse shadow-yellow-200"
            : "border-green-500 bg-green-50 shadow-green-200";

        const statusText =
          b.percentUsed >= 100
            ? "Budget breached"
            : b.percentUsed >= 80
            ? "Action required"
            : "On track";

        return (
          <div
            key={b.category}
            className={`relative rounded-2xl border-2 p-6 shadow-lg transition ${statusStyles}`}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-slate-800">
                {b.category}
              </h3>
              <span className="text-sm text-slate-600">
                {b.percentUsed}%
              </span>
            </div>

            {/* Amount */}
            <p className="text-sm text-slate-600 mb-4">
              Rs {b.spent} / Rs {b.limit}
            </p>

            {/* Progress bar */}
            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  b.percentUsed >= 100
                    ? "bg-red-500"
                    : b.percentUsed >= 80
                    ? "bg-yellow-400"
                    : "bg-green-500"
                }`}
                style={{
                  width: `${Math.min(b.percentUsed, 100)}%`
                }}
              />
            </div>

            {/* Status */}
            <p
              className={`mt-3 text-sm font-medium ${
                b.percentUsed >= 100
                  ? "text-red-600"
                  : b.percentUsed >= 80
                  ? "text-yellow-700"
                  : "text-green-700"
              }`}
              title={
                b.percentUsed >= 80 && b.percentUsed < 100
                  ? `Rs ${remaining} remaining`
                  : ""
              }
            >
              {statusText}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default BudgetStatusCards;
