import json
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from interview_platform.safe_runner import execute_code_safely
from resume_creator.models import Resume, ResumeVersion, ResumeSection
from career_profiles.models import UserProfile, Skill
from interview_platform.models import CandidateInterviewResume, Interview, QuestionBank

User = get_user_model()


class BurnettSuiteIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Admin user
        self.admin_user = User.objects.create_superuser(
            email="admin@burnettsuite.local",
            password="AdminPassword123!",
            first_name="Admin",
            last_name="User",
        )

        # Employee user
        self.employee_user = User.objects.create_user(
            email="employee@burnettsuite.local",
            password="EmployeePassword123!",
            first_name="Jane",
            last_name="Employee",
            role=User.Role.EMPLOYEE,
        )

        # Candidate user
        self.candidate_user = User.objects.create_user(
            email="candidate@burnettsuite.local",
            password="CandidatePassword123!",
            first_name="John",
            last_name="Candidate",
            role=User.Role.CANDIDATE,
        )

    def test_01_central_authentication_and_jwt(self):
        """Test central login returns access and refresh JWT tokens for unified user."""
        response = self.client.post("/api/auth/token/", {
            "email": "employee@burnettsuite.local",
            "password": "EmployeePassword123!",
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

        # Authenticate with token
        token = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        me_resp = self.client.get("/api/auth/me/")
        self.assertEqual(me_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(me_resp.data["email"], "employee@burnettsuite.local")
        self.assertEqual(me_resp.data["role"], "EMPLOYEE")

    def test_02_public_candidate_registration(self):
        """Test self-registration creates a central User and initializes CareerProfile."""
        response = self.client.post("/api/auth/register/", {
            "email": "newcandidate@burnettsuite.local",
            "first_name": "New",
            "last_name": "Applicant",
            "password": "SecurePassword123!",
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertEqual(response.data["user"]["role"], "CANDIDATE")

        # Verify career profile was created
        created = User.objects.get(email="newcandidate@burnettsuite.local")
        self.assertTrue(UserProfile.objects.filter(user=created).exists())

    def test_03_resume_creator_crud_and_ownership(self):
        """Test creating and versioning resumes for the authenticated central user."""
        self.client.force_authenticate(user=self.employee_user)

        # Create resume
        resp = self.client.post("/api/v1/resumes/", {"title": "Software Engineer Resume"})
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        resume_id = resp.data["id"]

        resume = Resume.objects.get(id=resume_id)
        self.assertEqual(resume.user, self.employee_user)
        self.assertEqual(resume.versions.count(), 1)

        # Candidate user cannot see employee's resume
        self.client.force_authenticate(user=self.candidate_user)
        list_resp = self.client.get("/api/v1/resumes/")
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        user_resume_ids = [r["id"] for r in list_resp.data]
        self.assertNotIn(resume_id, user_resume_ids)

    def test_04_interview_platform_models_and_isolation(self):
        """Test candidate interview creation and question banks."""
        self.client.force_authenticate(user=self.candidate_user)

        interview = Interview.objects.create(
            user=self.candidate_user,
            interview_type="technical",
            difficulty="medium",
            duration=30,
            status="pending",
        )
        self.assertEqual(interview.user, self.candidate_user)
        self.assertEqual(interview.status, "pending")

        # Create question in question bank
        q = QuestionBank.objects.create(
            title="Two Sum Problem",
            description="Find indices of two numbers that add up to target.",
            question_type="coding",
            difficulty="easy",
            topic="Algorithms",
        )
        self.assertEqual(str(q), "[Coding Challenge] Two Sum Problem (easy)")

    def test_05_safe_code_execution_runner(self):
        """Test safe runner executes valid code and catches timeouts/errors without touching web process."""
        # Simple print
        output = execute_code_safely("print('Hello from BurnettSuite!')")
        self.assertIn("Hello from BurnettSuite!", output)

        # Mathematical computation
        code = "nums = [x*2 for x in range(5)]; print(nums)"
        output = execute_code_safely(code)
        self.assertIn("[0, 2, 4, 6, 8]", output)

        # Syntax error safety
        output = execute_code_safely("def broken(:")
        self.assertIn("SyntaxError", output)

        # Infinite loop timeout safety (capped at 1s in test)
        timeout_code = "while True: pass"
        output = execute_code_safely(timeout_code, timeout_seconds=1.0)
        self.assertIn("timed out after 1.0 seconds", output)
