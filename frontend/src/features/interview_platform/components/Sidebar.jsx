import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();
  const menuItems = [
    { name: "Dashboard", path: "/interview-platform", icon: "🏠" },
    { name: "My Resume", path: "/interview-platform/resume-upload", icon: "📄" },
    { name: "Interviews", path: "/interview-platform/history", icon: "🎤" },
    { name: "Performance", path: "/interview-platform/performance", icon: "📊" },
    { name: "Interview Assistant", path: "/interview-platform/assistant", icon: "🤖" },
    { name: "Settings", path: "/interview-platform/settings", icon: "⚙️" },
  ];

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 flex-col bg-slate-950 p-6 text-white lg:flex" style={{ backgroundColor: "#002824", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
      <Link to="/interview-platform" className="mb-8 block">
        <h1 className="text-2xl font-bold" style={{ color: "#e6fffb" }}>AI Interviewer</h1>
        <p className="mt-1 text-sm text-slate-400" style={{ color: "#80cbc4" }}>Practice. Improve. Succeed.</p>
      </Link>
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const active =
            location.pathname === item.path ||
            (item.path !== "/interview-platform" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              state={item.path.includes("assistant") ? { startListening: true } : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                active
                  ? "bg-teal-700 text-white shadow-lg"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
              style={active ? { backgroundColor: "#00796b" } : {}}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-slate-300">BurnettSuite AI</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Switch to{" "}
            <Link to="/resume-creator" style={{ color: "#4db6ac", textDecoration: "underline" }}>
              Resume Creator
            </Link>
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
