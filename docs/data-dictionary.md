# BurnettSuite Integrated Data Dictionary & ERD

## 1. Overview

The BurnettSuite database uses a **single shared PostgreSQL database** with strict logical separation. Table names use explicit domain prefixes to prevent collisions across the three integrated applications.

Total Tables: **72 distinct tables**.

---

## 2. Collision-Resolved Domain Models

### A. Resume Models Conflict Resolution
| Concept | Unified Model Name | Database Table | Ownership / Foreign Key | Purpose |
|---|---|---|---|---|
| **Created / Tailored Resume** | `resume_creator.Resume` | `resume_creator_resume` | `user -> accounts.User` (`related_name="created_resumes"`) | Resumes built, edited, tailored, and exported by users in Resume Creator. |
| **Uploaded Candidate Resume** | `interview_platform.CandidateInterviewResume` | `interview_candidate_resume` | `user -> accounts.User` (`related_name="interview_candidate_resumes"`) | Uploaded PDF/DOCX files used to extract candidate context for mock interviews. |

### B. Resume Analysis Conflict Resolution
| Concept | Unified Model Name | Database Table | Relationships | Purpose |
|---|---|---|---|---|
| **ATS Gap Analysis** | `resume_creator.ResumeAnalysis` | `resume_creator_analysis` | `resume -> resume_creator.Resume`, `job_description -> JobDescription`, `ai_job -> AIJob` | ATS match scoring, missing keywords, and job description alignment recommendations. |
| **Interview Prep Extraction** | `ai_engine_app.ResumeAnalysis` | `interview_resume_analysis` | `resume -> CandidateInterviewResume` | Extracted skills, strengths, weaknesses, and interview questions derived from an uploaded resume. |

---

## 3. Core Entity Reference

### Identity & Authentication (`accounts`)
#### `accounts_user`
- `id` (BigAutoField, PK)
- `email` (EmailField, Unique, Indexed)
- `first_name` (CharField, max_length=150)
- `last_name` (CharField, max_length=150)
- `password` (CharField, max_length=128)
- `role` (CharField, choices=[`ADMIN`, `HR`, `MANAGER`, `EMPLOYEE`, `CANDIDATE`], default=`EMPLOYEE`)
- `is_active` (BooleanField, default=True)
- `is_staff` (BooleanField, default=False)
- `is_superuser` (BooleanField, default=False)
- `created_at` (DateTimeField, auto_now_add=True)
- `updated_at` (DateTimeField, auto_now=True)

---

### Career Profiles (`career_profiles`)
#### `career_user_profile`
- `id` (BigAutoField, PK)
- `user_id` (OneToOneField -> `accounts_user`, on_delete=CASCADE)
- `headline` (CharField, max_length=255)
- `summary` (TextField)
- `phone` (CharField, max_length=32)
- `location` (CharField, max_length=128)
- `website` (URLField)
- `created_at` / `updated_at` (DateTimeField)

#### `career_experiences`
- `id` (BigAutoField, PK)
- `profile_id` (ForeignKey -> `career_user_profile`, on_delete=CASCADE)
- `company` (CharField, max_length=255)
- `job_title` (CharField, max_length=255)
- `location` (CharField, max_length=128)
- `start_date` / `end_date` (DateField)
- `is_current` (BooleanField)
- `description` (TextField)

#### `career_skills`
- `id` (BigAutoField, PK)
- `profile_id` (ForeignKey -> `career_user_profile`, on_delete=CASCADE)
- `name` (CharField, max_length=128)
- `category` (CharField, max_length=64)
- `level` (CharField, max_length=32)

---

### AI Resume Creator (`resume_creator`, `job_descriptions_app`, `ai_jobs_app`)
#### `resume_creator_resume`
- `id` (BigAutoField, PK)
- `user_id` (ForeignKey -> `accounts_user`, on_delete=CASCADE, related_name="created_resumes")
- `title` (CharField, max_length=255)
- `target_job_title` (CharField, max_length=255)
- `target_industry` (CharField, max_length=128)
- `created_at` / `updated_at` (DateTimeField)

#### `resume_creator_version`
- `id` (BigAutoField, PK)
- `resume_id` (ForeignKey -> `resume_creator_resume`, on_delete=CASCADE)
- `version_number` (IntegerField)
- `is_current` (BooleanField)
- `notes` (CharField, max_length=255)

#### `resume_creator_section`
- `id` (BigAutoField, PK)
- `version_id` (ForeignKey -> `resume_creator_version`, on_delete=CASCADE)
- `section_type` (CharField, max_length=64)
- `heading` (CharField, max_length=128)
- `content` (JSONField)
- `order` (IntegerField)

#### `job_descriptions_jobdescription`
- `id` (BigAutoField, PK)
- `user_id` (ForeignKey -> `accounts_user`, on_delete=CASCADE)
- `title` (CharField, max_length=255)
- `company_name` (CharField, max_length=255)
- `raw_text` (TextField)
- `parsed_data` (JSONField)

---

### AI Interview Platform (`interview_platform`, `evaluations`)
#### `interview_candidate_resume`
- `id` (BigAutoField, PK)
- `user_id` (ForeignKey -> `accounts_user`, on_delete=CASCADE, related_name="interview_candidate_resumes")
- `file` (FileField, upload_to="candidate_resumes/")
- `raw_text` (TextField)
- `uploaded_at` (DateTimeField)

#### `interview_platform_interview`
- `id` (BigAutoField, PK)
- `user_id` (ForeignKey -> `accounts_user`, on_delete=CASCADE)
- `candidate_resume_id` (ForeignKey -> `interview_candidate_resume`, null=True, on_delete=SET_NULL)
- `interview_type` (CharField, choices=[`technical`, `hr`, `behavioral`])
- `difficulty` (CharField, choices=[`easy`, `medium`, `hard`])
- `status` (CharField, choices=[`pending`, `in_progress`, `completed`, `cancelled`])
- `started_at` / `completed_at` (DateTimeField, null=True)

#### `interview_platform_question`
- `id` (BigAutoField, PK)
- `interview_id` (ForeignKey -> `interview_platform_interview`, on_delete=CASCADE)
- `question_text` (TextField)
- `ideal_answer` (TextField)
- `order` (IntegerField)

#### `interview_platform_evaluation`
- `id` (BigAutoField, PK)
- `question_id` (ForeignKey -> `interview_platform_question`, on_delete=CASCADE)
- `score` (FloatField)
- `feedback` (TextField)
- `strengths` (JSONField)
- `weaknesses` (JSONField)
- `evaluated_at` (DateTimeField)
