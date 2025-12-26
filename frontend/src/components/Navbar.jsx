import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `px-4 py-2 rounded-lg transition ${
      pathname === path
        ? "bg-indigo-100 text-indigo-700"
        : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        <Link to="/" className="text-xl font-bold text-indigo-600">
          ExpenseFlow
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/" className={linkClass("/")}>Home</Link>
          <Link to="/dashboard" className={linkClass("/dashboard")}>Dashboard</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
