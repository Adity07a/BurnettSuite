import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Dashboard from "./pages/Dashboard"; 
import Resume from "./pages/Resume"; 
import InterviewSetup from "./pages/InterviewSetup"; 
import InterviewRoom from "./pages/InterviewRoom"; 
import InterviewResult from "./pages/InterviewResult"; 
import Interviews from "./pages/Interviews"; 
import Performance from "./pages/Performance"; 
import Settings from "./pages/Settings";
import InterviewAssistant from "./pages/InterviewAssistant";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

const Protected = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;
const ProtectedAdmin = ({ children }) => <AdminRoute>{children}</AdminRoute>;

function CentralAuthRedirect({ register = false }) {
  useEffect(() => {
    const target = register
      ? window.BurnettSuite?.registerUrl?.()
      : window.BurnettSuite?.loginUrl?.();
    window.location.replace(
      target || (register ? "http://localhost/register" : "http://localhost/login")
    );
  }, [register]);
  return <div className="p-8 text-center">Opening BurnettSuite authentication…</div>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Product entry opens the functional workspace, not a marketing page. */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<CentralAuthRedirect />} />
        <Route path="/register" element={<CentralAuthRedirect register />} />
        
        {/* Candidate Routes */}
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/resume" element={<Protected><Resume /></Protected>} />
        <Route path="/interview-setup" element={<Protected><InterviewSetup /></Protected>} />
        <Route path="/interviews" element={<Protected><Interviews /></Protected>} />
        <Route path="/performance" element={<Protected><Performance /></Protected>} />
        <Route path="/assistant" element={<Protected><InterviewAssistant /></Protected>} />
        <Route path="/settings" element={<Protected><Settings /></Protected>} />
        <Route path="/interview/:id" element={<Protected><InterviewRoom /></Protected>} />
        <Route path="/interview-result/:id" element={<Protected><InterviewResult /></Protected>} />

        {/* Staff/Admin Role-Protected Route */}
        <Route path="/admin-dashboard" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
