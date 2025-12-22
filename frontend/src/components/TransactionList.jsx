import { useEffect, useState } from "react";
import api from "../api/api";
const token = localStorage.getItem("token");


const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    api.get("/transactions?limit=6")
      .then(res => setTransactions(res.data));
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-700">
          Recent Transactions
        </h3>

        <div className="flex gap-2">
          <ExportButton label="CSV" url="/transactions/export/csv" />
          <ExportButton label="PDF" url="/transactions/export/pdf" />
        </div>
      </div>

      <ul className="divide-y">
        {transactions.map(t => (
          <li
            key={t._id}
            className="flex justify-between py-2 text-sm"
          >
            <span className="text-slate-600">
              {t.category}
            </span>
            <span
              className={`font-semibold ${
                t.type === "income"
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              Rs.{t.amount}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ExportButton = ({ label, url }) => {
  const token = localStorage.getItem("token");

  return (
    <button
      onClick={() =>
        window.open(
          `http://localhost:5000/api${url}?token=${token}`,
          "_blank"
        )
      }
      className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-sm"
    >
      {label}
    </button>
  );
};


export default TransactionList;
