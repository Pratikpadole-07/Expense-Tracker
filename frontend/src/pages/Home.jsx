import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 flex items-center">
      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block mb-4 px-4 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700">
            Smart Personal Finance
          </span>

          <h1 className="text-5xl font-extrabold text-slate-800 leading-tight">
            Understand Your Money.
            <span className="block text-indigo-600">
              Control It With Confidence.
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-600">
            Track expenses, set category budgets, scan receipts,
            and get warned before overspending.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 hover:scale-[1.03] transition"
            >
              Get Started Free
            </Link>

            <Link
              to="/login"
              className="px-8 py-4 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 transition"
            >
              Login
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
