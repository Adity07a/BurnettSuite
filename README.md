# BurnettSuite — Unified Enterprise HRMS & AI Career Platform

BurnettSuite is an enterprise-grade platform integrating three foundational systems into **one unified product and coordinated deployment unit**:
- **BurnettPeople HRMS:** Human resource management, employee directories, department hierarchies, attendance tracking, leave requests, and central authentication.
- **AI Resume Creator:** ATS resume builder, section versioning, template exports, and job description gap analysis powered by Ollama (`qwen2.5:3b`).
- **AI Interview Platform:** Real-time mock interview prep, voice answers, question bank, Monaco code execution sandbox, and performance evaluation powered by AWS Bedrock (`zai.glm-4.7-flash`, `nvidia.nemotron-super-3-120b`).

---

## 1. Architectural Highlights

1. **Single Source of Truth for Identity (`accounts.User`):**
   - BurnettPeople's custom `accounts.User` is the sole `AUTH_USER_MODEL`.
   - Native role hierarchy: `ADMIN`, `HR`, `MANAGER`, `EMPLOYEE`, and `CANDIDATE`.
   - Public candidate registration at `/api/auth/register/` automatically provisions candidate credentials and initializes a candidate career profile (`career_profiles.UserProfile`).
2. **Unified Database with Logical Domain Separation:**
   - Single PostgreSQL database (`DATABASE_URL`, with automatic SQLite fallback for offline dev/tests).
   - Explicit table prefixes prevent collisions across apps:
     - `resume_creator_resume` (Resume Creator) vs `interview_candidate_resume` (Interview Platform)
     - `resume_creator_analysis` (ATS gap analysis) vs `interview_resume_analysis` (Interview Prep extraction)
     - `career_*` (UserProfile, Experience, Projects, Skills)
   - Zero table collisions across 72 cleanly separated database tables.
3. **Security Hardening (Isolated Code Execution):**
   - Eliminated the critical vulnerability where student code was executed with arbitrary Python `exec()` inside the web server process.
   - Implemented `backend/interview_platform/safe_runner.py` executing code in an isolated subprocess (`sys.executable -I -s`) with strict 5.0-second timeouts and output bounds.
4. **Unified Frontend Experience:**
   - Single React 19 + Vite 8 application in `frontend/`.
   - BurnettPeople teal/mint design system (`#004d40`, `#00796b`, `#e0f2f1`, `#ffffff`) applied across all views.
   - Top-level **Suite Switcher (`SuiteBar.jsx`)** allows seamless 1-click navigation between HRMS, Resume Creator, Interview Platform, and Career Profile.
   - Unified JWT token synchronization in `frontend/src/api/client.js`.

---

## 2. Project Layout

```
BurnettSuite/
├── backend/                       # Unified Django 6.1 Backend
│   ├── accounts/                  # Central Identity & AUTH_USER_MODEL
│   ├── career_profiles/           # Candidate Profile, Experience, Skills
│   ├── resume_creator/            # Resume Builder, Versions, Sections, Templates
│   ├── job_descriptions_app/      # JD Upload, Parsing & History
│   ├── ai_jobs_app/               # Asynchronous AI Tasks & Worker
│   ├── interview_platform/        # Interviews, Questions, Safe Code Runner
│   ├── evaluations/               # Answer Scoring & Feedback
│   ├── interview_assistant_app/   # Real-time Voice & Audio AI Assistant
│   ├── ai_engine_app/             # LLM Inference & Resume Extraction
│   ├── organization/              # HRMS Departments & Structure
│   ├── employees/                 # HRMS Employee Lifecycle
│   ├── attendance/                # HRMS Attendance & Clock-in
│   ├── config/                    # Unified Settings, URLs, Celery, WSGI
│   ├── scripts/                   # Legacy Data Migration Scripts
│   ├── tests/                     # Integration Test Suite
│   └── manage.py
├── frontend/                      # Unified React 19 + Vite SPA
│   ├── src/
│   │   ├── api/                   # Central API Client & JWT Token Sync
│   │   ├── auth/                  # User Display & Session Utilities
│   │   ├── components/            # SuiteBar, RouteBoundary, Shared Layouts
│   │   ├── features/
│   │   │   ├── resume_creator/    # Resume Builder, Templates, ATS Analysis
│   │   │   └── interview_platform/# Interview Room, Assistant, Monaco Editor
│   │   ├── pages/                 # Candidate Register, Login, Dashboards
│   │   └── App.jsx                # Unified Router & Suite Provider
│   ├── package.json
│   └── vite.config.js
├── docs/                          # Architecture & Data Dictionary
│   ├── architecture.md
│   └── data-dictionary.md
├── docker-compose.yml             # Coordinated Multi-Service Deployment
├── Dockerfile.backend
├── Dockerfile.frontend
└── README.md
```

---

## 3. Quick Start Guide

### Option A: Running with Docker Compose (Recommended)

1. Clone or navigate to the repository:
   ```bash
   cd BurnettSuite
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Build and launch all services (PostgreSQL, Redis, Backend, Worker, Frontend):
   ```bash
   docker-compose up --build
   ```
4. Access the unified suite:
   - **Frontend App:** http://localhost:5173
   - **Backend API:** http://localhost:8000/api/
   - **Django Admin:** http://localhost:8000/admin/

---

### Option B: Running Locally

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 4. Verification & Testing

### Running Backend Integration Tests
Execute the comprehensive test suite verifying central JWT authentication, candidate registration, resume ownership, interview platform setup, and safe code execution runner:
```bash
cd backend
python manage.py test tests
```

### Running Frontend Production Build
Verify zero bundle errors, unresolved imports, or lint breaks:
```bash
cd frontend
npm run build
```

### Running Legacy Data Migration Script
Migrate data from legacy standalone instances into the unified database:
```bash
python backend/scripts/migrate_legacy_data.py --source-db BurnettPeople/backend/db.sqlite3 --dry-run
```
Remove `--dry-run` to commit changes.

---

## 5. Seed Accounts & Credentials

For local development and testing, the following accounts are available (passwords: `Password@123` or your configured credentials):
- **Admin:** `admin@burnettpeople.com` (Role: `ADMIN`)
- **HR Manager:** `mayankjoshi0341@gmail.com` (Role: `HR`)
- **Candidate User:** Register a new account via `/register` or use `candidate@burnettpeople.com` (Role: `CANDIDATE`).
