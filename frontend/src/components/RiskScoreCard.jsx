import { useEffect, useState } from "react";
import api from "../api/api";

const getStyle = (level) => {
  if (level === "HIGH")
    return {
      bg: "bg-red-50",
      border: "border-red-500",
      text: "text-red-700"
    };

  if (level === "MEDIUM")
    return {
      bg: "bg-yellow-50",
      border: "border-yellow-400",
      text: "text-yellow-700"
    };

  return {
    bg: "bg-green-50",
    border: "border-green-500",
    text: "text-green-700"
  };
};

const RiskScoreCard = ({ refreshKey }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/insights/risk-score")
      .then(res => setData(res.data))
      .catch(() => setData(null));
  }, [refreshKey]);

  if (!data) return null;

  const style = getStyle(data.level);

  return (
    <div
      className={`rounded-3xl border ${style.border} ${style.bg} p-8 shadow-xl mb-16`}
    >
      <p className="text-sm text-slate-500 mb-1">
        Financial Risk
      </p>

      <div className="flex items-baseline gap-4">
        <p className={`text-5xl font-extrabold ${style.text}`}>
          {data.score}
        </p>
        <span className="text-xl text-slate-500">/ 100</span>
      </div>

      <p className={`mt-2 text-lg font-semibold ${style.text}`}>
        {data.level}
      </p>

      <div className="mt-6 text-sm text-slate-600 grid grid-cols-3 gap-4">
        <div>Budget: {data.signals.budgetUsage}</div>
        <div>Habits: {data.signals.repeatSpending}</div>
        <div>Velocity: {data.signals.velocity}</div>
      </div>
    </div>
  );
};

export default RiskScoreCard;
