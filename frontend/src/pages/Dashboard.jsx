import Charts from "../components/Charts";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import {useState} from "react"
const Dashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey(prev => prev + 1);
  return (
    <div className="min-h-screen bg-slate-100 px-8 py-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        Expense Dashboard
      </h1>

     <Charts refreshKey={refreshKey} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        <TransactionForm onSuccess={refresh} />
      <TransactionList refreshKey={refreshKey} />
      </div>
    </div>
  );
};

export default Dashboard;
