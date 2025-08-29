# core/auth/viewsets/verify_email.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.user.models import User
from django.utils import timezone

class VerifyEmailView(APIView):
    permission_classes = []
    authentication_classes = []

    def get(self, request, token):
        try:
            user = User.objects.get(email_verification_token=token)
            # Срок жизни токена 24 часа
            if user.email_verification_sent and (timezone.now() - user.email_verification_sent).total_seconds() > 86400:
                user.delete()
                return Response({'detail': 'Срок действия ссылки истёк, пользователь удалён.'}, status=status.HTTP_410_GONE)
            user.is_active = True
            user.is_email_verified = True
            user.email_verification_token = None
            user.save()
            return Response({'detail': 'Email успешно подтверждён. Теперь вы можете войти.'})
        except User.DoesNotExist:
            return Response({'detail': 'Некорректная или устаревшая ссылка.'}, status=status.HTTP_404_NOT_FOUND)
