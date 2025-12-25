import { useEffect, useState } from "react";
import api from "../api/api";

const getBarColor = (percent) => {
  if (percent >= 100) return "bg-red-500";
  if (percent >= 80) return "bg-yellow-400";
  return "bg-green-500";
};

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {budgets.map(b => {
        const remaining = b.limit - b.spent;

        return (
          <div
            key={b.category}
            className={`bg-white rounded-xl shadow-md p-6 transition ${
              b.percentUsed >= 100 ? "animate-shake border border-red-500" : ""
            }`}
          >
            {/* HEADER */}
            <div className="flex justify-between mb-2">
              <h3 className="font-semibold text-slate-700">
                {b.category}
              </h3>
              <span className="text-sm font-medium text-slate-500">
                {b.percentUsed}%
              </span>
            </div>

            {/* AMOUNTS */}
            <p className="text-sm text-slate-600 mb-1">
              Rs {b.spent} / Rs {b.limit}
            </p>

            <p className={`text-xs mb-3 ${
              remaining < 0 ? "text-red-600" : "text-slate-500"
            }`}>
              {remaining >= 0
                ? `Rs ${remaining} remaining`
                : `Rs ${Math.abs(remaining)} over budget`}
            </p>

            {/* PROGRESS BAR */}
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${getBarColor(b.percentUsed)} transition-all duration-700`}
                style={{
                  width: `${Math.min(b.percentUsed, 100)}%`
                }}
              />
            </div>

            {/* STATUS */}
            {b.percentUsed >= 100 && (
              <p className="text-xs text-red-600 mt-2 font-semibold">
                Budget exceeded
              </p>
            )}

            {b.percentUsed >= 80 && b.percentUsed < 100 && (
              <p className="text-xs text-yellow-600 mt-2 font-semibold">
                Approaching limit
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BudgetStatusCards;
