# core/user/serializers.py
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import User
from core.abstract.serializers import AbstractSerializer


class UserSerializer(AbstractSerializer):
    id = serializers.UUIDField(source='public_id', read_only=True, format='hex')
    created = serializers.DateTimeField(read_only=True)
    updated = serializers.DateTimeField(read_only=True)

    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    avatar = serializers.ImageField(required=False, allow_null=True)

    # email — обязателен и уникален
    email = serializers.EmailField(
        required=True,
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message='Пользователь с таким email уже зарегистрирован.'
            )
        ]
    )

    # phone_number — может быть пустым, но если указан — должен быть уникальным
    phone_number = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True
    )

    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'email', 'phone_number',
            'is_active', 'created', 'updated', 'password', 'avatar'
        ]
        read_only_fields = ['is_active']

    def validate_phone_number(self, value: str | None) -> str | None:
        """
        Если номер не пустой — проверяем уникальность вручную,
        чтобы не ругаться на пустые/NULL значения.
        """
        if value is None or value == '':
            return value
        qs = User.objects.filter(phone_number=value)
        # при update исключаем самого себя
        instance = getattr(self, 'instance', None)
        if instance is not None:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError('Пользователь с таким номером уже зарегистрирован.')
        return value
