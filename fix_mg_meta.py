content = open('BurnettPeople/frontend/src/ManagerDashboard.jsx', encoding='utf-8').read()

# Add ai-services to PAGE_META before "status-updates"
old = '"status-updates": [\n  "Work Status Updates",\n  "Record completed work, current focus, testing, tech stack and blockers.",\n],\n};'
new = '"ai-services": ["AI Services", "Leverage the power of AI to build your career and prepare for opportunities."],\n  "status-updates": [\n  "Work Status Updates",\n  "Record completed work, current focus, testing, tech stack and blockers.",\n],\n};'

if old in content:
    content = content.replace(old, new, 1)
    open('BurnettPeople/frontend/src/ManagerDashboard.jsx', 'w', encoding='utf-8').write(content)
    print('ManagerDashboard PAGE_META patched')
else:
    print('WARNING: pattern not found, trying alternate...')
    # find location
    idx = content.find('"status-updates": [')
    print(repr(content[idx-5:idx+160]))

# Also verify HRDashboard
hr = open('BurnettPeople/frontend/src/HRDashboard.jsx', encoding='utf-8').read()
print('=== HRDashboard ===')
print('AIServicesPage import:', 'AIServicesPage' in hr)
print('ai-services in NAV:', 'ai-services' in hr)
print('ai-services in PAGE_META:', '"ai-services"' in hr)
print('ai-services case:', 'case "ai-services"' in hr)
