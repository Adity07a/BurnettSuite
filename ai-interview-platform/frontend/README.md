AI-Powered Interview Platform

An intelligent AI-driven technical interview platform designed to automate candidate evaluations, resume parsing, and interview practice. Built with a Django (REST Framework) backend and a React frontend, powered by PostgreSQL.

🚀 Features

Resume Processing & Parsing: Upload candidate resumes (PDF format) to automatically extract key skills, work experience, and candidate info.

AI Interview Engine: Generates tailored interview questions and evaluates responses dynamically.

Database Management: Shifted to PostgreSQL for high performance, scalability, and production-ready deployments.

Candidate Evaluation Dashboard: Detailed metrics and feedback on candidate interview performance.

Admin Controls: Manage users, resumes, question banks, and session history via Django Admin.

🛠️ Tech Stack

Backend

Framework: Django, Django REST Framework

Database: PostgreSQL (Production-ready)

Language: Python 3.10+

Authentication: Token-based / Session Authentication

Frontend

Framework: React.js (Vite)

UI & Styling: CSS3 / Modern Web Components

State & API: Axios for API calls

📁 Project Structure

AI_Interview_Platform/
├── backend/
│   ├── ai_engine/          # Core AI analysis and question generation logic
│   ├── config/             # Project settings (settings.py, urls.py, wsgi.py)
│   ├── evaluations/        # Candidate performance scoring and evaluation models
│   ├── interviews/         # Interview session models, views, and serializers
│   ├── media/              # Storage for uploaded resumes and media files
│   ├── manage.py           # Django management script
│   └── requirements.txt    # Python dependencies
└── frontend/
    ├── src/
    │   ├── assets/         # Images, icons, and static assets
    │   ├── components/     # Reusable UI components
    │   ├── context/        # React Context API providers
    │   ├── hooks/          # Custom React hooks
    │   ├── pages/          # App pages (Dashboard, Interview, Upload, etc.)
    │   └── services/       # API call definitions (api.js)
    ├── package.json        # Frontend dependencies
    └── vite.config.js      # Vite build configuration


⚙️ Installation & Setup

Prerequisites

Python (v3.10 or higher)

Node.js & npm (v18 or higher)

PostgreSQL Installed and running

1. Backend Setup

Clone the repository:

git clone https://github.com/your-username/AI_Interview_Platform.git
cd AI_Interview_Platform/backend


Create and activate a Virtual Environment:

Windows:

python -m venv venv
venv\Scripts\activate


Mac/Linux:

python3 -m venv venv
source venv/bin/activate


Install Dependencies:

pip install -r requirements.txt


Configure Database (PostgreSQL):
Ensure PostgreSQL is running, create a database named ai_interview_db, and configure your config/settings.py:

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'ai_interview_db',
        'USER': 'postgres',
        'PASSWORD': 'your_postgres_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}


Run Migrations & Start Server:

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser  # Create admin account
python manage.py runserver


Backend will run on: http://127.0.0.1:8000/

2. Frontend Setup

Navigate to frontend directory:

cd ../frontend


Install Node modules:

npm install


Run Development Server:

npm run dev


Frontend will run on: http://localhost:5173/ (or port specified by Vite)


