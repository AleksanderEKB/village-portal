from uuid import uuid4
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import serializers

from core.user.serializers import UserSerializer
from core.user.models import User
from core.utils.sanitize import strip_all_html

class RegisterSerializer(UserSerializer):
    password = serializers.CharField(max_length=128, min_length=8, write_only=True, required=True)
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone_number', 'password', 'avatar']

    def create(self, validated_data):
        # САНИТАЙЗИМ ПЕРЕД СОЗДАНИЕМ
        validated_data['first_name'] = strip_all_html(validated_data.get('first_name', '').strip())
        validated_data['last_name'] = strip_all_html(validated_data.get('last_name', '').strip())
        if validated_data.get('phone_number'):
            validated_data['phone_number'] = strip_all_html(validated_data['phone_number'].strip())

        user = User.objects.create_user(**validated_data)
        user.is_active = False
        user.is_email_verified = False
        user.email_verification_token = uuid4()
        user.email_verification_sent = timezone.now()
        user.save()

        verification_link = f"{settings.MY_HOST}/verify-email/{user.email_verification_token}/"
        send_mail(
            subject='Подтвердите ваш email на bhair.online',
            message=(
                "Здравствуйте!\n\nДля завершения регистрации перейдите по ссылке:\n"
                f"{verification_link}\n\nЕсли вы не регистрировались, проигнорируйте это письмо."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return user
