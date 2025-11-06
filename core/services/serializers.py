# core/services/serializers.py
from rest_framework import serializers
from .models import Service


class ServiceListSerializer(serializers.ModelSerializer):
    short_description = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = ('id', 'title', 'slug', 'short_description', 'price', 'image_url')

    def get_short_description(self, obj: Service) -> str:
        text = (obj.description or '').strip()
        limit = 100

        # Если текст короче/равен лимиту — возвращаем как есть
        if len(text) <= limit:
            return text

        # Расширяем обрезку до конца текущего слова (до первого пробела после лимита)
        i = limit
        n = len(text)
        while i < n and not text[i].isspace():
            i += 1

        snippet = text[:i].rstrip()

        # Сохраняем прежнюю семантику: раз исходный текст > 100, добавляем многоточие
        # Если нужно добавлять "..." ТОЛЬКО когда действительно обрезали, то:
        # return snippet + ('...' if i < n else '')
        return snippet + '...'

    def get_image_url(self, obj: Service) -> str | None:
        request = self.context.get('request')
        if obj.image:
            url = obj.image.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return None


class ServiceDetailSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = ('id', 'title', 'slug', 'description', 'price', 'image_url', 'is_active', 'created_at', 'updated_at')

    def get_image_url(self, obj: Service) -> str | None:
        request = self.context.get('request')
        if obj.image:
            url = obj.image.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return None
