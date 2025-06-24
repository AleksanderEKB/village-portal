from rest_framework import serializers
from .models import Social, SocialPhone


class SocialPhoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialPhone
        fields = '__all__'

class SocialSerializer(serializers.ModelSerializer):
    phones = SocialPhoneSerializer(many=True, read_only=True)

    class Meta:
        model = Social
        fields = '__all__'
