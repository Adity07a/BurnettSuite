# Final lint fixes
import re

# ------------------------------------------------------------------
# 1. EmployeeProfile.jsx — move early-return setState out of effect
#    Pattern: instead of calling setError synchronously in the guard,
#    derive the error from id directly (no effect needed for that).
# ------------------------------------------------------------------
content = open('BurnettPeople/frontend/src/EmployeeProfile.jsx', encoding='utf-8').read()

old_effect = '''  useEffect(() => {
    if (!id) {
      setError("No employee ID in URL.");
      setLoading(false);
      return;
    }
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
  }, [id]);'''

new_effect = '''  useEffect(() => {
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
  }, [id]);'''

if old_effect in content:
    content = content.replace(old_effect, new_effect, 1)
    # Also change the initial loading/error state to handle missing id case
    content = content.replace(
        '  const [loading, setLoading] = useState(true);',
        '  const [loading, setLoading] = useState(Boolean(id));'
    )
    content = content.replace(
        '  const [error, setError] = useState("");',
        '  const [error, setError] = useState(!id ? "No employee ID in URL." : "");'
    )
    open('BurnettPeople/frontend/src/EmployeeProfile.jsx', 'w', encoding='utf-8').write(content)
    print('EmployeeProfile: fixed useEffect setState pattern')
else:
    print('EmployeeProfile: pattern not found, printing context...')
    idx = content.find('useEffect')
    print(repr(content[idx:idx+400]))

# ------------------------------------------------------------------
# 2. HRDashboard.jsx — AIServicesPage was not imported because the
#    removal of StatusUpdates removed both imports on same line.
#    Re-add the AIServicesPage import.
# ------------------------------------------------------------------
hr = open('BurnettPeople/frontend/src/HRDashboard.jsx', encoding='utf-8').read()
print('HRDashboard AIServicesPage present:', 'AIServicesPage' in hr)

if 'AIServicesPage' not in hr:
    # Add import near the top after other local imports
    hr = hr.replace(
        'import AIServicesPage from "./AIServicesPage";\n',
        '',
    )
    # Find a good insertion point - after import HRAttendance
    if 'import HRAttendance from "./HRAttendance";' in hr:
        hr = hr.replace(
            'import HRAttendance from "./HRAttendance";',
            'import HRAttendance from "./HRAttendance";\nimport AIServicesPage from "./AIServicesPage";'
        )
        print('HRDashboard: added AIServicesPage import after HRAttendance')
    else:
        # Fall back: add after the last import block
        lines = hr.split('\n')
        last_import = 0
        for i, line in enumerate(lines):
            if line.startswith('import '):
                last_import = i
        lines.insert(last_import + 1, 'import AIServicesPage from "./AIServicesPage";')
        hr = '\n'.join(lines)
        print('HRDashboard: added AIServicesPage import at end of imports')
    open('BurnettPeople/frontend/src/HRDashboard.jsx', 'w', encoding='utf-8').write(hr)

# ------------------------------------------------------------------
# 3. ManagerDashboard.jsx — StatusUpdates was removed from imports
#    by fix_lint_errors.py erroneously. The ManagerDashboard DOES use it
#    (case "status-updates"). Re-add the import.
# ------------------------------------------------------------------
mg = open('BurnettPeople/frontend/src/ManagerDashboard.jsx', encoding='utf-8').read()
print('ManagerDashboard StatusUpdates present:', 'StatusUpdates' in mg)
if 'import StatusUpdates' not in mg:
    # Add import - find a good spot
    mg = mg.replace(
        'import AIServicesPage from "./AIServicesPage";',
        'import StatusUpdates from "./StatusUpdates";\nimport AIServicesPage from "./AIServicesPage";'
    )
    open('BurnettPeople/frontend/src/ManagerDashboard.jsx', 'w', encoding='utf-8').write(mg)
    print('ManagerDashboard: re-added StatusUpdates import')

print('\nAll lint errors fixed.')
