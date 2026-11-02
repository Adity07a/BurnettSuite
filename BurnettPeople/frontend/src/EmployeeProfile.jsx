import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import apiClient from "./api/client";
import "./EmployeeList.css";


const LABELS = {
  employee_code: "Employee ID",
  official_email: "Work email",
  phone_number: "Mobile number",
  department_name: "Department",
  designation_title: "Designation",
  manager_name: "Manager",
  work_location_name: "Work location",
  employment_type: "Employment type",
  employment_status: "Employment status",
  date_of_joining: "Date of joining",
  date_of_exit: "Date of exit",
  portal_role: "Portal role",
  account_activation_status: "Account status",
};


function displayValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value).replaceAll("_", " ").toLowerCase().replace(
    /(^|\s)\S/g,
    (letter) => letter.toUpperCase(),
  );
}


export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiClient
      .get(`/employees/${id}/`)
      .then((data) => {
        if (active) setEmployee(data);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError?.message || "Could not load this employee.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const name = employee
    ? `${employee.first_name || ""} ${employee.last_name || ""}`.trim()
    : "Employee profile";

  return (
    <main className="employee-list-page">
      <header className="employee-list-header">
        <div>
          <p className="employee-list-eyebrow">PEOPLE MANAGEMENT</p>
          <h1>{name || "Employee profile"}</h1>
          <p>Persisted employment and portal account information.</p>
        </div>
        <button
          type="button"
          className="employee-list-view-button"
          onClick={() => navigate("/employees")}
        >
          Back to employees
        </button>
      </header>

      {loading && <div className="employee-list-notice">Loading employee…</div>}
      {error && <div className="employee-list-notice" role="alert">{error}</div>}

      {employee && (
        <section className="employee-list-panel">
          <div className="employee-list-panel-heading">
            <div>
              <h2>{name}</h2>
              <p>{employee.employee_code}</p>
            </div>
          </div>
          <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", padding: "1rem" }}>
            {Object.entries(LABELS).map(([field, label]) => (
              <div key={field} style={{ padding: "1rem", border: "1px solid var(--border, #d8e1de)", borderRadius: "12px" }}>
                <dt style={{ color: "var(--text-muted, #60736d)", fontSize: ".8rem", marginBottom: ".35rem" }}>{label}</dt>
                <dd style={{ margin: 0, fontWeight: 600 }}>{displayValue(employee[field])}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </main>
  );
}
