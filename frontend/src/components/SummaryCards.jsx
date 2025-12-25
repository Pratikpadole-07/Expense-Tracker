import { useEffect, useState } from "react";
import api from "../api/api";

const Card = ({ title, value, color }) => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <p className="text-sm text-slate-500">{title}</p>
    <p className={`text-2xl font-bold mt-2 ${color}`}>
      Rs. {value.toLocaleString()}
    </p>
  </div>
);

const SummaryCards = ({ refreshKey }) => {
  const [data, setData] = useState({
    income: 0,
    expense: 0,
    balance: 0
  });

  useEffect(() => {
    api.get("/transactions/summary").then(res => {
      setData(res.data);
    });
  }, [refreshKey]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card
        title="Total Income"
        value={data.income}
        color="text-green-600"
      />
      <Card
        title="Total Expense"
        value={data.expense}
        color="text-red-600"
      />
      <Card
        title="Balance"
        value={data.balance}
        color={
          data.balance >= 0 ? "text-blue-600" : "text-red-700"
        }
      />
    </div>
  );
};

export default SummaryCards;
