content = open('BurnettPeople/frontend/src/ManagerDashboard.jsx', encoding='utf-8').read()
print('=== ManagerDashboard ===')
print('AIServicesPage import:', 'AIServicesPage' in content)
print('ai-services in NAV:', 'ai-services' in content)
print('ai-services case:', 'case "ai-services"' in content)

# Find & print status-updates block
idx = content.find('"status-updates": [')
if idx != -1:
    print('status-updates PAGE_META block:', repr(content[idx:idx+150]))
else:
    print('status-updates not found as object key')
    idx2 = content.find('status-updates')
    print('status-updates first occurrence:', repr(content[max(0,idx2-20):idx2+120]))
