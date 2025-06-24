# auth/serializers/register.py
from rest_framework import serializers

from backend.serializers import UserSerializer
from backend.models import User

class RegisterSerializer(UserSerializer):
    password = serializers.CharField(max_length=128, min_length=8, write_only=True, required=True)
    avatar = serializers.ImageField(required=False, allow_null=True)

    def create(self, validated_data):
        if 'avatar' not in validated_data:
            validated_data['avatar'] = 'default/avatar.webp'
        return User.objects.create_user(**validated_data)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'password', 'avatar']
