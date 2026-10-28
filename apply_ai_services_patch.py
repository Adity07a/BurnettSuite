"""
Apply all AI Services integration patches to BurnettPeople frontend.
Run from BurnettSuite_temp root:  python apply_ai_services_patch.py
"""
import sys

def patch(path, replacements):
    content = open(path, encoding="utf-8").read()
    for old, new in replacements:
        if old not in content:
            print(f"  WARNING: target not found in {path}:\n  {old[:80]!r}")
        else:
            content = content.replace(old, new, 1)
    open(path, "w", encoding="utf-8").write(content)
    print(f"Patched: {path}")


# ── EmployeeDashboard.jsx ──────────────────────────────────────────────────
patch(
    "BurnettPeople/frontend/src/EmployeeDashboard.jsx",
    [
        # NAV — add AI Services before notifications
        (
            '  { id: "notifications", label: "Notifications", icon: "bell", badge: true },\n'
            '  { id: "status-updates", label: "Work Status Updates", icon: "file" },\n];',
            '  { id: "ai-services", label: "AI Services", icon: "sun" },\n'
            '  { id: "notifications", label: "Notifications", icon: "bell", badge: true },\n'
            '  { id: "status-updates", label: "Work Status Updates", icon: "file" },\n];'
        ),
        # PAGE_META — add ai-services entry
        (
            '  notifications: ["Notifications", "Updates about your requests and attendance."],',
            '  "ai-services": ["AI Services", "Leverage the power of AI to build your career and prepare for opportunities."],\n'
            '  notifications: ["Notifications", "Updates about your requests and attendance."],'
        ),
        # renderPage() — add ai-services case
        (
            '      case "status-updates": return <StatusUpdates user={user} />;',
            '      case "ai-services": return <AIServicesPage />;\n'
            '      case "status-updates": return <StatusUpdates user={user} />;'
        ),
    ]
)

# ── HRDashboard.jsx ────────────────────────────────────────────────────────
hr = open("BurnettPeople/frontend/src/HRDashboard.jsx", encoding="utf-8").read()

# Add import
if "AIServicesPage" not in hr:
    hr = hr.replace(
        'import StatusUpdates from "./StatusUpdates";',
        'import StatusUpdates from "./StatusUpdates";\nimport AIServicesPage from "./AIServicesPage";',
        1
    )

patch(
    "BurnettPeople/frontend/src/HRDashboard.jsx",
    [
        # NAV — add AI Services before notifications
        (
            '  { id: "notifications", label: "Notifications", icon: "bell", badge: true },\n'
            '  { id: "profile", label: "My Profile", icon: "user" },\n'
            '  { id: "status-updates", label: "Work Status Updates", icon: "file" },\n];',
            '  { id: "ai-services", label: "AI Services", icon: "sun" },\n'
            '  { id: "notifications", label: "Notifications", icon: "bell", badge: true },\n'
            '  { id: "profile", label: "My Profile", icon: "user" },\n'
            '  { id: "status-updates", label: "Work Status Updates", icon: "file" },\n];'
        ),
        # PAGE_META — add ai-services entry
        (
            '  "status-updates": [\n'
            '  "Work Status Updates",\n'
            '  "Record completed work, current focus, testing, tech stack and blockers.",],\n};',
            '  "ai-services": ["AI Services", "Leverage the power of AI to build your career and prepare for opportunities."],\n'
            '  "status-updates": [\n'
            '  "Work Status Updates",\n'
            '  "Record completed work, current focus, testing, tech stack and blockers.",],\n};'
        ),
        # renderPage() — add ai-services case before default
        (
            '      default:\n        return <ComingSoon title={title} />;\n    }\n  }',
            '      case "ai-services": return <AIServicesPage />;\n'
            '      default:\n        return <ComingSoon title={title} />;\n    }\n  }'
        ),
    ]
)

# Re-write with import fix applied before patch
content = open("BurnettPeople/frontend/src/HRDashboard.jsx", encoding="utf-8").read()
if "AIServicesPage" not in content:
    content = content.replace(
        'import StatusUpdates from "./StatusUpdates";',
        'import StatusUpdates from "./StatusUpdates";\nimport AIServicesPage from "./AIServicesPage";',
        1
    )
    open("BurnettPeople/frontend/src/HRDashboard.jsx", "w", encoding="utf-8").write(content)
    print("  Added AIServicesPage import to HRDashboard")


# ── ManagerDashboard.jsx ───────────────────────────────────────────────────
mg = open("BurnettPeople/frontend/src/ManagerDashboard.jsx", encoding="utf-8").read()

if "AIServicesPage" not in mg:
    mg = mg.replace(
        'import { useMemo, useState } from "react";',
        'import { useMemo, useState } from "react";\nimport AIServicesPage from "./AIServicesPage";',
        1
    )
    open("BurnettPeople/frontend/src/ManagerDashboard.jsx", "w", encoding="utf-8").write(mg)
    print("Added AIServicesPage import to ManagerDashboard")

patch(
    "BurnettPeople/frontend/src/ManagerDashboard.jsx",
    [
        # NAV — add AI Services before notifications
        (
            '  { id: "notifications", label: "Notifications", icon: "bell" },\n'
            '  { id: "status-updates", label: "Work Status Updates", icon: "file" },\n];',
            '  { id: "ai-services", label: "AI Services", icon: "sun" },\n'
            '  { id: "notifications", label: "Notifications", icon: "bell" },\n'
            '  { id: "status-updates", label: "Work Status Updates", icon: "file" },\n];'
        ),
        # PAGE_META — add ai-services entry
        (
            '  "status-updates": [\n'
            '  "Work Status Updates",\n'
            '  "Record completed work, current focus, testing, tech stack and blockers.",\n];',
            '  "ai-services": ["AI Services", "Leverage the power of AI to build your career and prepare for opportunities."],\n'
            '  "status-updates": [\n'
            '  "Work Status Updates",\n'
            '  "Record completed work, current focus, testing, tech stack and blockers.",\n];'
        ),
        # renderPage() — add ai-services case
        (
            '      case "status-updates": return <StatusUpdates user={user} />;',
            '      case "ai-services": return <AIServicesPage />;\n'
            '      case "status-updates": return <StatusUpdates user={user} />;'
        ),
    ]
)


# ── AdminDashboard.jsx ─────────────────────────────────────────────────────
ad = open("BurnettPeople/frontend/src/AdminDashboard.jsx", encoding="utf-8").read()

if "AIServicesPage" not in ad:
    ad = ad.replace(
        'import { useEffect, useMemo, useState } from "react";',
        'import { useEffect, useMemo, useState } from "react";\nimport AIServicesPage from "./AIServicesPage";',
        1
    )
    open("BurnettPeople/frontend/src/AdminDashboard.jsx", "w", encoding="utf-8").write(ad)
    print("Added AIServicesPage import to AdminDashboard")

patch(
    "BurnettPeople/frontend/src/AdminDashboard.jsx",
    [
        # NAV — add AI Services before notifications
        (
            '  { id: "notifications", label: "Notifications", icon: "bell", badge: true },\n'
            '  { id: "status-updates", label: "Work Status Updates", icon: "file" },',
            '  { id: "ai-services", label: "AI Services", icon: "sun" },\n'
            '  { id: "notifications", label: "Notifications", icon: "bell", badge: true },\n'
            '  { id: "status-updates", label: "Work Status Updates", icon: "file" },'
        ),
        # PAGE_META — add ai-services entry
        (
            '  "status-updates": [\n'
            '  "Work Status Updates",\n'
            '  "Record completed work, current focus, testing, tech stack and blockers.",\n],',
            '  "ai-services": ["AI Services", "Leverage the power of AI to build your career and prepare for opportunities."],\n'
            '  "status-updates": [\n'
            '  "Work Status Updates",\n'
            '  "Record completed work, current focus, testing, tech stack and blockers.",\n],'
        ),
        # renderPage() — add ai-services case before default
        (
            '      case "status-updates": return <StatusUpdates user={user} />;\n'
            '      default: return <ComingSoon title={title} />;',
            '      case "ai-services": return <AIServicesPage />;\n'
            '      case "status-updates": return <StatusUpdates user={user} />;\n'
            '      default: return <ComingSoon title={title} />;'
        ),
    ]
)

print("\nAll patches applied.")
