import { useEffect, useState } from "react";
import api from "../api/api";

const getBarColor = (percent) => {
  if (percent >= 100) return "bg-red-500";
  if (percent >= 80) return "bg-yellow-400";
  return "bg-indigo-500";
};

const MonthlySpendCard = ({ refreshKey }) => {
  const [expense, setExpense] = useState(0);
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const summaryRes = await api.get("/transactions/summary");
      const budgetRes = await api.get(
        `/budgets/total?month=${new Date().toISOString().slice(0, 7)}`
      );

      setExpense(summaryRes.data.expense || 0);
      setBudget(budgetRes.data.totalBudget || 0);
    };

    fetchData();
  }, [refreshKey]);

  const percentUsed =
    budget > 0 ? Math.min(Math.round((expense / budget) * 100), 100) : 0;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border">
      <p className="text-slate-500 text-sm mb-2">This month</p>

      <p className="text-3xl font-bold text-slate-800">
        ₹{expense.toLocaleString()} spent
      </p>

      <div className="mt-6 h-3 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getBarColor(percentUsed)} transition-all duration-700`}
          style={{ width: `${percentUsed}%` }}
        />
      </div>

      <p className="mt-3 text-sm text-slate-500">
        {percentUsed}% of ₹{budget.toLocaleString()} budget used
      </p>

      {percentUsed >= 100 && (
        <p className="mt-2 text-sm text-red-600 font-medium">
          Budget exceeded
        </p>
      )}
    </div>
  );
};

export default MonthlySpendCard;
