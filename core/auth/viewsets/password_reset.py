# core/auth/viewsets/password_reset.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from core.auth.serializers.password_reset import (
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Всегда возвращаем 200, чтобы не палить существование email
        return Response({'detail': 'Если такой email существует, мы отправили письмо со ссылкой для сброса пароля.'}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Пароль успешно обновлён. Теперь вы можете войти.'}, status=status.HTTP_200_OK)
