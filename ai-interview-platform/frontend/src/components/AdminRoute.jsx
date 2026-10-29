import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import api from "../services/api";

export default function AdminRoute({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.get("suite-auth/session/").then(({ data }) => {
      setUser(data);
      setReady(true);
    }).catch(() => {
      window.location.assign(window.BurnettSuite?.loginUrl?.() || "/login");
    });
  }, []);

  if (!ready) return <div className="p-8 text-center">Loading your BurnettSuite session…</div>;
  if (!user?.is_staff) return <Navigate to="/dashboard" replace />;
  return children;
}
