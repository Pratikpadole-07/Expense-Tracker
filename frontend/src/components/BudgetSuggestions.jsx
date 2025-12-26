import { useEffect, useState } from "react";
import api from "../api/api";

const BudgetSuggestions = ({ refresh }) => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    api
      .get("/budgets/suggestions")
      .then(res => setSuggestions(res.data))
      .catch(() => setSuggestions([]));
  }, []);

  if (!suggestions.length) return null;

  return (
    <section className="mb-20">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800">
          Smart Budget Suggestions
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Based on your recent spending patterns
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suggestions.map(s => (
          <div
            key={s.category}
            className="relative rounded-2xl border border-indigo-200 bg-indigo-50/60 p-6 shadow-sm hover:shadow-md transition"
          >
            {/* BADGE */}
            <span className="absolute top-4 right-4 text-xs font-medium text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
              Suggested
            </span>

            {/* CONTENT */}
            <h3 className="text-lg font-semibold text-slate-800">
              {s.category}
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Based on last month, you typically spent around this amount.
            </p>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-indigo-700">
                ₹{s.recommendedLimit}
              </span>
              <span className="text-sm text-slate-500">
                per month
              </span>
            </div>

            {/* ACTION */}
            <button
              onClick={() =>
                api
                  .post("/budgets", {
                    category: s.category,
                    limit: s.recommendedLimit,
                    month: new Date().toISOString().slice(0, 7)
                  })
                  .then(refresh)
              }
              className="mt-6 w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
            >
              Apply this budget
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BudgetSuggestions;
