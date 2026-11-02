import { useEffect, useState } from "react";

import api from "../services/api";

function ProtectedRoute({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    api.get("suite-auth/session/").then(({ data }) => {
      localStorage.setItem("user", JSON.stringify(data));
      if (active) setReady(true);
    }).catch(() => {
      window.location.assign(window.BurnettSuite?.loginUrl?.() || "/login");
    });
    return () => { active = false; };
  }, []);

  return ready
    ? children
    : <div className="p-8 text-center">Loading your BurnettSuite session…</div>;
}

export default ProtectedRoute;
