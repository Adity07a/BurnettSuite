hr = open('BurnettPeople/frontend/src/HRDashboard.jsx', encoding='utf-8').read()
# Check the first 30 lines for imports
lines = hr.split('\n')[:35]
for i, l in enumerate(lines):
    print(f'{i+1}: {l}')

# Also check the render case
idx = hr.find('ai-services')
print('\nai-services context:')
print(repr(hr[idx-20:idx+80]))
