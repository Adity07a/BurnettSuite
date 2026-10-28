hr = open('BurnettPeople/frontend/src/HRDashboard.jsx', encoding='utf-8').read()

# The import wasn't there - the 'present' check was incorrect (maybe 'AIServicesPage' appeared in a comment or string search).
# Directly add import after HRExceptionReview import
if 'import AIServicesPage' not in hr:
    hr = hr.replace(
        'import HRExceptionReview from "./HRExceptionReview";',
        'import HRExceptionReview from "./HRExceptionReview";\nimport AIServicesPage from "./AIServicesPage";'
    )
    print('Added AIServicesPage import to HRDashboard')
else:
    print('AIServicesPage import already present')

open('BurnettPeople/frontend/src/HRDashboard.jsx', 'w', encoding='utf-8').write(hr)

# verify
hr2 = open('BurnettPeople/frontend/src/HRDashboard.jsx', encoding='utf-8').read()
print('Verified in file:', 'import AIServicesPage' in hr2)
