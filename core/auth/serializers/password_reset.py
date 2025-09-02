# core/auth/serializers/password_reset.py
from uuid import uuid4
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from core.user.models import User

RESET_TOKEN_TTL_SEC = 3600  # 1 час

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def create(self, validated_data):
        email = validated_data['email'].lower().strip()
        try:
            user = User.objects.get(email=email, is_active=True, is_email_verified=True)
        except User.DoesNotExist:
            # Не раскрываем наличие пользователя
            return {}

        user.password_reset_token = uuid4()
        user.password_reset_sent = timezone.now()
        user.save(update_fields=['password_reset_token', 'password_reset_sent'])

        reset_link = f"{settings.MY_HOST}/reset-password/{user.password_reset_token}/"
        send_mail(
            subject='Сброс пароля на bhair.online',
            message=(
                "Здравствуйте!\n\nВы запросили восстановление пароля.\n"
                f"Перейдите по ссылке, чтобы установить новый пароль:\n{reset_link}\n\n"
                "Если вы не отправляли запрос, проигнорируйте это письмо."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return {}

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_password(self, value):
        validate_password(value)  # стандартные валидаторы Django
        return value

    def create(self, validated_data):
        token = validated_data['token']
        new_password = validated_data['password']

        try:
            user = User.objects.get(password_reset_token=token)
        except User.DoesNotExist:
            raise serializers.ValidationError({'detail': 'Некорректная или устаревшая ссылка.'})

        # Проверка TTL
        sent_at = user.password_reset_sent
        if not sent_at or (timezone.now() - sent_at).total_seconds() > RESET_TOKEN_TTL_SEC:
            # Сбрасываем токен, чтобы не переиспользовали
            user.password_reset_token = None
            user.password_reset_sent = None
            user.save(update_fields=['password_reset_token', 'password_reset_sent'])
            raise serializers.ValidationError({'detail': 'Срок действия ссылки истёк. Запросите новую.'})

        user.set_password(new_password)
        user.password_reset_token = None
        user.password_reset_sent = None
        user.save()
        return {}
