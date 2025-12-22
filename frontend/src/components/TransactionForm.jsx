import { useState } from "react";
import api from "../api/api";

const TransactionForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    description: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.amount || !form.category) {
      return;
    }

    try {
      setLoading(true);

      await api.post("/transactions", {
        ...form,
        amount: Number(form.amount),
        date: new Date()
      });

      // reset form
      setForm({
        type: "expense",
        amount: "",
        category: "",
        description: ""
      });

      // notify dashboard to refresh charts + list
      onSuccess();
    } catch (err) {
      console.error("Add transaction failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="font-semibold text-slate-700 mb-4">
        Add Transaction
      </h3>

      <form onSubmit={submit} className="space-y-4">
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <input
          name="amount"
          value={form.amount}
          placeholder="Amount"
          className="w-full border rounded-lg px-3 py-2"
          onChange={handleChange}
        />

        <input
          name="category"
          value={form.category}
          placeholder="Category"
          className="w-full border rounded-lg px-3 py-2"
          onChange={handleChange}
        />

        <input
          name="description"
          value={form.description}
          placeholder="Description (optional)"
          className="w-full border rounded-lg px-3 py-2"
          onChange={handleChange}
        />

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Transaction"}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
