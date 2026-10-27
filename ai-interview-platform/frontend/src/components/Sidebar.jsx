import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "My Resume", path: "/resume", icon: "📄" },
    { name: "Interviews", path: "/interviews", icon: "🎤" },
    { name: "Performance", path: "/performance", icon: "📊" },
    { name: "Interview Assistant", path: "/assistant", icon: "AI" },
    { name: "Settings", path: "/settings", icon: "⚙️" },
  ];

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 flex-col bg-slate-950 p-6 text-white lg:flex">
      <Link to="/dashboard" className="mb-10 block">
        <h1 className="text-2xl font-bold">AI Interviewer</h1>
        <p className="mt-2 text-sm text-slate-400">Practice. Improve. Succeed.</p>
      </Link>
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const active = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path + "/"));
          return (
            <Link key={item.path} to={item.path} state={item.path === "/assistant" ? { startListening: true } : undefined} className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
              <span className="text-lg">{item.icon}</span><span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-semibold text-slate-300">AI Interview Platform</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">Practice with resume-aware AI interviews.</p>
      </div>
    </aside>
  );
}
export default Sidebar;
