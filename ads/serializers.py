# ads/serializers.py
from rest_framework import serializers
from django.db import models
from .models import Advertisement, AdvertisementImage, Category
from backend.serializers import UserSerializer


class AdvertisementImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdvertisementImage
        fields = ['id', 'image', 'order']


class AdvertisementSerializer(serializers.ModelSerializer):
    images = AdvertisementImageSerializer(many=True, read_only=True)
    main_image = serializers.ImageField(required=False, allow_null=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Advertisement
        fields = [
            'id', 'user', 'title', 'description', 'category', 'price',
            'location', 'contact_phone', 'contact_email', 'created_at',
            'updated_at', 'is_active', 'main_image', 'slug', 'images'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at', 'slug']

    def validate_category(self, value):
        if value not in dict(Category.choices):
            raise serializers.ValidationError("Некорректная категория.")
        return value

    def validate(self, data):
        request = self.context.get('request')
        if request and request.method in ['POST', 'PUT', 'PATCH']:
            images_data = request.FILES.getlist('images')
            instance = getattr(self, 'instance', None)
            current_images_count = instance.images.count() if instance else 0
            if images_data and (current_images_count + len(images_data)) > 5:
                raise serializers.ValidationError(
                    f'Можно добавить не более 5 изображений к одному объявлению. Сейчас: {current_images_count}, добавляете: {len(images_data)}'
                )
        category = data.get('category') or getattr(self.instance, 'category', None)
        if category in ['free', 'loss', 'sundry']:
            data['price'] = None
        return data
    
    def update(self, instance, validated_data):
        # Сохраняем обычные поля
        instance = super().update(instance, validated_data)

        request = self.context.get('request')
        if request and request.FILES.getlist('images'):
            images = request.FILES.getlist('images')
            # Определяем максимальный order
            max_order = instance.images.aggregate(models.Max('order'))['order__max'] or 0
            for idx, image in enumerate(images):
                AdvertisementImage.objects.create(
                    advertisement=instance,
                    image=image,
                    order=max_order + idx + 1
                )
        return instance


class AdvertisementCreateSerializer(serializers.ModelSerializer):
    main_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Advertisement
        fields = [
            'id', 'title', 'description', 'category', 'price',
            'location', 'contact_phone', 'contact_email', 'is_active',
            'main_image',
        ]
    
    def validate(self, data):
        request = self.context.get('request')
        images = request.FILES.getlist('images')
        if len(images) > 5:
            raise serializers.ValidationError('Можно добавить не более 5 изображений к одному объявлению.')
        main_image = request.FILES.get('main_image')
        if main_image and images:
            for img in images:
                if hasattr(main_image, 'name') and hasattr(img, 'name') and main_image.name == img.name:
                    raise serializers.ValidationError("Основное изображение не должно совпадать с дополнительными.")
        category = data.get('category')
        if category in ['free', 'loss', 'sundry']:
            data['price'] = None
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        images = request.FILES.getlist('images')
        ad = Advertisement.objects.create(**validated_data)
        for i, image in enumerate(images):
            AdvertisementImage.objects.create(advertisement=ad, image=image, order=i)
        return ad

    def validate_category(self, value):
        if value not in dict(Category.choices):
            raise serializers.ValidationError("Некорректная категория.")
        return value

