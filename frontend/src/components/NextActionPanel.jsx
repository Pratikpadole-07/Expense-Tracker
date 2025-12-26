const NextActionPanel = ({ category, percentUsed, onDismiss }) => {
  if (!category || percentUsed < 80) return null;

  return (
    <div className="rounded-3xl bg-white shadow-xl p-8 flex flex-col justify-between h-full">
      <div>
        <p className="text-sm text-slate-500 mb-2">
          Next action
        </p>

        <h3 className="text-2xl font-bold text-slate-800">
          Pause {category} spending
        </h3>

        <p className="mt-3 text-slate-600">
          For the next <span className="font-semibold">3 days</span>
        </p>

        <p className="mt-2 text-sm text-slate-500">
          You’ll stay under budget
        </p>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={onDismiss}
          className="flex-1 rounded-xl bg-indigo-600 text-white py-3 font-medium hover:bg-indigo-700 transition"
        >
          Mark as done
        </button>

        <button
          onClick={onDismiss}
          className="flex-1 rounded-xl border border-slate-300 py-3 text-slate-600 hover:bg-slate-100 transition"
        >
          Snooze
        </button>
      </div>
    </div>
  );
};

export default NextActionPanel;
