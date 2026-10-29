from rest_framework_simplejwt.authentication import JWTAuthentication


class SuiteCookieJWTAuthentication(JWTAuthentication):
    """Authenticate the shared suite JWT from a header or HttpOnly cookie."""

    def authenticate(self, request):
        raw_token = request.COOKIES.get("burnett_suite_access")
        if raw_token:
            validated_token = self.get_validated_token(raw_token.encode())
            return self.get_user(validated_token), validated_token
        return super().authenticate(request)
