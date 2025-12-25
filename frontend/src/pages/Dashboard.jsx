import { useState } from "react";
import Charts from "../components/Charts";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import SummaryCards from "../components/SummaryCards";
import BudgetStatusCards from "../components/BudgetStatusCards";

const Dashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(prev => prev + 1);

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-6">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Expense Dashboard
        </h1>
        <p className="text-slate-500 text-sm">
          Track spending, budgets, and trends
        </p>
      </div>

      {/* SUMMARY */}
      <SummaryCards refreshKey={refreshKey} />
      
      <BudgetStatusCards refreshKey={refreshKey} />
      {/* CHARTS */}
      <div className="mt-10 bg-white rounded-xl shadow-md p-6">
        <Charts refreshKey={refreshKey} />
      </div>

      {/* FORM + LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        <div className="lg:col-span-1">
          <TransactionForm onSuccess={refresh} />
        </div>

        <div className="lg:col-span-2">
          <TransactionList refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
