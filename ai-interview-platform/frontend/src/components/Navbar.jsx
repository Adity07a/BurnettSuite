import { Link } from "react-router-dom";

function getUserName() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.email || "Candidate";
  } catch {
    return "Candidate";
  }
}

function Navbar() {
  const userName = getUserName();
  const initial = userName.charAt(0).toUpperCase();

  const logout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;
    window.BurnettSuite?.logout?.();
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Interview Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">Track your interview preparation</p>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <Link to="/assistant" state={{ startListening: true }} className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">Assistant</Link>
        <button type="button" className="hidden h-10 w-10 items-center justify-center rounded-xl text-lg hover:bg-slate-100 sm:flex" aria-label="Notifications">🔔</button>
        <div className="flex items-center gap-3 border-l border-slate-200 pl-3 sm:pl-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">{initial}</div>
          <div className="hidden sm:block">
            <p className="font-semibold capitalize text-slate-800">{userName}</p>
            <p className="text-xs text-slate-500">Interview Candidate</p>
          </div>
          <button onClick={logout} type="button" className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600">Logout</button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
