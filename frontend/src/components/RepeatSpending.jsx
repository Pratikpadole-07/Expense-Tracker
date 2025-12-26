import { useEffect, useState } from "react";
import api from "../api/api";

const getStyle = (count) => {
  if (count >= 8) {
    return {
      border: "border-red-500",
      bg: "bg-red-50",
      badge: "bg-red-100 text-red-700",
      message: "This is draining your money",
    };
  }

  if (count >= 4) {
    return {
      border: "border-yellow-400",
      bg: "bg-yellow-50",
      badge: "bg-yellow-100 text-yellow-700",
      message: "This is becoming expensive",
    };
  }

  return {
    border: "border-green-400",
    bg: "bg-green-50",
    badge: "bg-green-100 text-green-700",
    message: "Spending is under control",
  };
};

const RepeatSpending = ({ refreshKey }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    api
      .get("/transactions/repeat-spending")
      .then(res => setData(res.data))
      .catch(() => setData([]));
  }, [refreshKey]);

  if (!data.length) return null;

  return (
    <section className="mb-16">
      <h2 className="text-xl font-semibold text-slate-800 mb-6">
        Spending Habits You Should Watch
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.map(item => {
          const style = getStyle(item.count);

          return (
            <div
              key={item.category}
              className={`relative rounded-2xl border ${style.border} ${style.bg} p-6 shadow-sm`}
            >
              {/* STATUS BADGE */}
              <span
                className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${style.badge}`}
              >
                {item.count >= 8
                  ? "Budget leakage"
                  : item.count >= 4
                  ? "Habit forming"
                  : "Stable"}
              </span>

              {/* CATEGORY */}
              <h3 className="mt-4 text-2xl font-bold text-slate-800">
                {item.category}
              </h3>

              {/* METRICS */}
              <div className="mt-4 space-y-1 text-sm text-slate-600">
                <p>
                  Used <span className="font-semibold">{item.count}</span> times this month
                </p>
                <p>
                  Total spent{" "}
                  <span className="font-semibold">
                    Rs {Math.round(item.totalAmount)}
                  </span>
                </p>
                <p>
                  Avg per transaction{" "}
                  <span className="font-semibold">
                    Rs {Math.round(item.avgAmount)}
                  </span>
                </p>
              </div>

              {/* WARNING MESSAGE */}
              <p className="mt-5 text-sm font-medium text-slate-700">
                {style.message}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RepeatSpending;
