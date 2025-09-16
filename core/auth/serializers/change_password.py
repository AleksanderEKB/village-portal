# core/auth/serializeras/chnage_password.py
from django.contrib.auth import password_validation
from rest_framework import serializers

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, trim_whitespace=False)
    new_password = serializers.CharField(write_only=True, trim_whitespace=False, min_length=8)

    def validate(self, attrs):
        user = self.context['request'].user
        if not user.check_password(attrs['old_password']):
            raise serializers.ValidationError({'old_password': 'Неверный текущий пароль.'})
        password_validation.validate_password(attrs['new_password'], user=user)
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        user.set_password(validated_data['new_password'])
        user.save(update_fields=['password', 'updated'])
        return {}
