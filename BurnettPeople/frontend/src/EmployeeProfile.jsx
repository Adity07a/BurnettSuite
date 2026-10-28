import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "./api/client";
import "./EmployeeList.css";

/* ------------------------------------------------------------------
   EmployeeProfile  —  fetches one employee by numeric primary key.
   Accessible at /employees/:id (HR / Admin only via App.jsx routes).
   ------------------------------------------------------------------ */

function field(label, value) {
  return (
    <div className="emp-profile-field" key={label}>
      <dt>{label}</dt>
      <dd>{value || "—"}</dd>
    </div>
  );
}

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(!id ? "No employee ID in URL." : "");

  useEffect(() => {
    if (!id) return;
    let active = true;
    apiClient
      .get(`/employees/${id}/`)
      .then((data) => { if (active) setEmployee(data); })
      .catch((err) => {
        if (!active) return;
        if (err?.status === 404) {
          setError("Employee record not found.");
        } else if (err?.status === 403) {
          setError("You do not have permission to view this profile.");
        } else {
          setError(err?.message || "Could not load employee profile.");
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const name = employee
    ? `${employee.first_name || ""} ${employee.last_name || ""}`.trim() ||
      employee.official_email ||
      "Employee"
    : "";

  return (
    <div style={{ padding: "2rem", maxWidth: 720 }}>
      <button
        type="button"
        className="employee-list-view-button"
        onClick={() => navigate(-1)}
        style={{ marginBottom: "1.5rem" }}
      >
        ← Back
      </button>

      {loading && <p className="employee-list-empty">Loading profile…</p>}
      {error && <p className="employee-list-empty" role="alert" style={{ color: "var(--color-red, #e53e3e)" }}>{error}</p>}

      {employee && (
        <section>
          <h2 style={{ marginBottom: "0.25rem" }}>{name}</h2>
          <p style={{ color: "var(--color-text-secondary, #6b7280)", marginBottom: "1.5rem" }}>
            {employee.designation_title || "—"} · {employee.department_name || "—"}
          </p>

          <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
            {field("Employee Code", employee.employee_code)}
            {field("Work Email", employee.official_email)}
            {field("Employment Type", employee.employment_type)}
            {field("Employment Status", employee.employment_status)}
            {field("Date of Joining", employee.date_of_joining)}
            {field("Work Location", employee.work_location_name)}
            {field("Manager", employee.manager_name)}
            {field("Phone", employee.phone_number)}
            {field("Portal Role", employee.portal_role)}
            {field("Account Status", employee.account_activation_status)}
          </dl>
        </section>
      )}
    </div>
  );
}
