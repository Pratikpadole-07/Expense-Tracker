import { useState } from "react";
import api from "../api/api";

const TransactionForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    description: "",
    receipt: null
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "receipt") {
      setForm({ ...form, receipt: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.amount || !form.category) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("type", form.type);
      formData.append("amount", Number(form.amount));
      formData.append("category", form.category);
      formData.append("description", form.description);
      formData.append("date", new Date().toISOString());

      if (form.receipt) {
        formData.append("receipt", form.receipt);
      }

      await api.post("/transactions", formData);

      // reset form
      setForm({
        type: "expense",
        amount: "",
        category: "",
        description: "",
        receipt: null
      });

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

        {/* RECEIPT UPLOAD */}
        <input
          type="file"
          name="receipt"
          accept="image/*"
          className="w-full text-sm"
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
