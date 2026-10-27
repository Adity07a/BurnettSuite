from django.contrib.auth.models import User
from rest_framework.test import APITestCase


class RegistrationTests(APITestCase):
    def payload(self):
        return {"full_name": "Test Candidate", "username": "candidate", "email": "candidate@example.com",
                "password": "Sensible!Pass842", "confirm_password": "Sensible!Pass842"}

    def test_registration_ignores_stale_token_and_login_works(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer expired-token")
        response = self.client.post("/api/users/register/", self.payload())
        self.assertEqual(response.status_code, 201, response.data)
        self.assertNotIn("password", response.data)
        self.assertTrue(User.objects.get(username="candidate").check_password("Sensible!Pass842"))
        response = self.client.post("/api/users/login/", {"username": "candidate", "password": "Sensible!Pass842"})
        self.assertEqual(response.status_code, 200, response.data)
        response = self.client.post("/api/users/token/refresh/", {"refresh": response.data["refresh"]})
        self.assertEqual(response.status_code, 200, response.data)
        self.assertIn("refresh", response.data)

    def test_weak_password_rejected(self):
        data = self.payload()
        data.update(password="123", confirm_password="123")
        response = self.client.post("/api/users/register/", data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.data)
