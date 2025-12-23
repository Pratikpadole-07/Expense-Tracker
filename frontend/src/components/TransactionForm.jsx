import { useState } from "react";
import api from "../api/api";
import { extractTextFromImage } from "../utils/ocr";
import { parseReceiptText } from "../utils/receiptParser";

const TransactionForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    description: "",
    receipt: null
  });

  const [loading, setLoading] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "receipt") {
      const file = files[0];
      setForm(prev => ({ ...prev, receipt: file }));

      setOcrLoading(true);
      extractTextFromImage(file)
        .then(text => {
          setOcrText(text);
          const parsed = parseReceiptText(text);
          setSuggestions(parsed);

          setForm(prev => ({
            ...prev,
            amount:
              parsed.amount !== null && !isNaN(parsed.amount)
                ? parsed.amount
                : prev.amount,
            category: parsed.category || prev.category,
            description: parsed.merchant || prev.description
          }));
        })
        .finally(() => setOcrLoading(false));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    // strict but correct validation
    if (form.amount === "" || !form.category) return;

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

      setForm({
        type: "expense",
        amount: "",
        category: "",
        description: "",
        receipt: null
      });
      setOcrText("");
      setSuggestions(null);

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

        <input
          type="file"
          name="receipt"
          accept="image/*"
          onChange={handleChange}
        />

        {ocrLoading && (
          <p className="text-sm text-slate-500">
            Reading receipt...
          </p>
        )}

        {ocrText && (
          <div className="border rounded-lg p-3 text-xs bg-slate-50 max-h-40 overflow-auto">
            <pre className="whitespace-pre-wrap">{ocrText}</pre>
          </div>
        )}

        {suggestions && (
          <p className="text-xs text-green-600">
            Fields auto-suggested from receipt. Please verify.
          </p>
        )}

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
