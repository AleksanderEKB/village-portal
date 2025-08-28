# core/auth/serializers/register.py
from rest_framework import serializers
from core.user.serializers import UserSerializer
from core.user.models import User
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from uuid import uuid4


class RegisterSerializer(UserSerializer):
    password = serializers.CharField(max_length=128, min_length=8, write_only=True, required=True)
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'password', 'avatar']


    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        user.is_active = False  # Неактивен до подтверждения
        user.is_email_verified = False
        user.email_verification_token = uuid4()
        user.email_verification_sent = timezone.now()
        user.save()

        # Отправка письма
        verification_link = f"{settings.MY_HOST}/verify-email/{user.email_verification_token}/"
        send_mail(
            subject='Подтвердите ваш email на bhair.online',
            message=f"Здравствуйте!\n\nДля завершения регистрации перейдите по ссылке:\n{verification_link}\n\nЕсли вы не регистрировались, проигнорируйте это письмо.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return user