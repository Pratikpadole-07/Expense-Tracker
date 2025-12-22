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

const Charts = () => {
  const [incomeExpense, setIncomeExpense] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/transactions/summary/income-expense")
      .then(res => setIncomeExpense(res.data));

    api.get("/transactions/summary/category")
      .then(res => setCategories(res.data));
  }, []);

  const income = incomeExpense.find(i => i._id === "income")?.total || 0;
  const expense = incomeExpense.find(i => i._id === "expense")?.total || 0;
  const balance = income - expense;

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <SummaryCard title="Income" value={income} color="text-green-600" />
        <SummaryCard title="Expense" value={expense} color="text-red-500" />
        <SummaryCard title="Balance" value={balance} color="text-blue-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Income vs Expense">
          <Bar
            data={{
              labels: ["Income", "Expense"],
              datasets: [{
                data: [income, expense],
                backgroundColor: ["#22c55e", "#ef4444"]
              }]
            }}
          />
        </Card>

        <Card title="Expense by Category">
          <Pie
            data={{
              labels: categories.map(c => c._id),
              datasets: [{
                data: categories.map(c => c.total),
                backgroundColor: [
                  "#3b82f6",
                  "#f97316",
                  "#a855f7",
                  "#ef4444",
                  "#22c55e"
                ]
              }]
            }}
          />
        </Card>
      </div>
    </>
  );
};

const Card = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <h3 className="font-semibold text-slate-700 mb-4">{title}</h3>
    {children}
  </div>
);

const SummaryCard = ({ title, value, color }) => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <p className="text-slate-500 text-sm">{title}</p>
    <p className={`text-2xl font-bold mt-2 ${color}`}>
      Rs.{value}
    </p>
  </div>
);

export default Charts;
