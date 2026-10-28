content = open('BurnettPeople/frontend/src/EmployeeDashboard.jsx', encoding='utf-8').read()

content = content.replace(
    'import StatusUpdates from \"./StatusUpdates\";',
    'import StatusUpdates from \"./StatusUpdates\";\nimport AIServicesPage from \"./AIServicesPage\";',
    1
)

print('AIServicesPage imported:', 'AIServicesPage' in content)
open('BurnettPeople/frontend/src/EmployeeDashboard.jsx', 'w', encoding='utf-8').write(content)
