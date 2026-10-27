from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer, CustomTokenObtainPairSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    authentication_classes = []


class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]

class ToggleUserActiveStatusView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            # Toggle active status
            user.is_active = not user.is_active
            user.save()
            return Response({
                "message": f"User {'activated' if user.is_active else 'deactivated'} successfully",
                "is_active": user.is_active
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

