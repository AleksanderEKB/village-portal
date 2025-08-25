# backend/serializers.py

from rest_framework import serializers
from .models import User
# from abstract.serializers import AbstractSerializer


class UserSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='public_id', read_only=True, format='hex')
    created = serializers.DateTimeField(read_only=True)
    updated = serializers.DateTimeField(read_only=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    avatar = serializers.ImageField(required=False, allow_null=True)


    # def update(self, instance, validated_data):
    #     password = validated_data.pop('password', None)
    #     instance = super().update(instance, validated_data)
    #     if password:
    #         instance.set_password(password)
    #         instance.save()
    #     return instance
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_active', 'created', 'updated', 'password', 'avatar']
        read_only_field = ['is_active']
