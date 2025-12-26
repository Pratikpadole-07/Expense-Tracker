import { useState } from "react";

import RiskScoreCard from "../components/RiskScoreCard";
import BudgetStatusCards from "../components/BudgetStatusCards";
import RepeatSpending from "../components/RepeatSpending";
import NextActionPanel from "../components/NextActionPanel";
import SummaryCards from "../components/SummaryCards";
import Charts from "../components/Charts";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";

const Dashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCharts, setShowCharts] = useState(false);
  const [actionDismissed, setActionDismissed] = useState(false);

  const refresh = () => setRefreshKey(prev => prev + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-100 to-sky-50">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* HEADER */}
        <header className="mb-14">
          <h1 className="text-4xl font-extrabold text-slate-800">
            Financial Health Monitor
          </h1>
          <p className="mt-2 text-slate-600">
            Risks, habits, and actions that matter right now.
          </p>
        </header>

        {/* 1️⃣ RISK SCORE — ABSOLUTE TOP */}
        <RiskScoreCard refreshKey={refreshKey} />

        {/* 2️⃣ PROBLEMS + ACTION */}
        <section className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* LEFT: PROBLEMS */}
          <div className="lg:col-span-2 space-y-16">
            <BudgetStatusCards refreshKey={refreshKey} />
            <RepeatSpending refreshKey={refreshKey} />
          </div>

          {/* RIGHT: NEXT ACTION */}
          <div className="hidden lg:block">
            {!actionDismissed && (
              <NextActionPanel
                onDismiss={() => setActionDismissed(true)}
              />
            )}
          </div>

        </section>

        {/* 3️⃣ CONTEXT (SUMMARY) */}
        <section className="mt-20">
          <SummaryCards refreshKey={refreshKey} />
        </section>

        {/* 4️⃣ OPTIONAL ANALYTICS */}
        <section className="mt-20">
          <button
            onClick={() => setShowCharts(prev => !prev)}
            className="mb-6 text-sm font-medium text-indigo-600 hover:underline"
          >
            {showCharts ? "Hide analytics" : "View analytics"}
          </button>

          {showCharts && (
            <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-3xl shadow-xl p-8">
              <Charts refreshKey={refreshKey} />
            </div>
          )}
        </section>

        {/* 5️⃣ EXECUTION */}
        <section className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
            <div className="bg-white/90 rounded-3xl shadow-xl p-8">
              <TransactionForm onSuccess={refresh} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white/90 rounded-3xl shadow-xl p-8">
              <TransactionList refreshKey={refreshKey} />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;
