import { useEffect, useState } from "react";
import api from "../api/api";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const Charts = ({ refreshKey }) => {
  const [incomeExpense, setIncomeExpense] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/transactions/summary/income-expense")
      .then(res => setIncomeExpense(res.data));

    api.get("/transactions/summary/category")
      .then(res => setCategories(res.data));
  }, [refreshKey]);

  const income =
    incomeExpense.find(i => i._id === "income")?.total || 0;
  const expense =
    incomeExpense.find(i => i._id === "expense")?.total || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card title="Income vs Expense">
        <Bar
          data={{
            labels: ["Income", "Expense"],
            datasets: [
              {
                data: [income, expense],
                backgroundColor: ["#22c55e", "#ef4444"]
              }
            ]
          }}
        />
      </Card>

      <Card title="Expense by Category">
        <Pie
          data={{
            labels: categories.map(c => c._id),
            datasets: [
              {
                data: categories.map(c => c.total),
                backgroundColor: [
                  "#3b82f6",
                  "#f97316",
                  "#a855f7",
                  "#ef4444",
                  "#22c55e"
                ]
              }
            ]
          }}
        />
      </Card>
    </div>
  );
};

const Card = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <h3 className="font-semibold text-slate-700 mb-4">
      {title}
    </h3>
    {children}
  </div>
);

export default Charts;
