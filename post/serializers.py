# post/serializers.py
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from abstract.serializers import AbstractSerializer
from backend.serializers import UserSerializer
from post.models import Post
from backend.models import User
from comment.models import Comment
from .utils import validate_image_upload, delete_file_safely, sanitize_html

class PostSerializer(AbstractSerializer):
    author = serializers.SlugRelatedField(queryset=User.objects.all(), slug_field='public_id')
    liked = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    image = serializers.ImageField(required=False, allow_null=True)

    def validate_author(self, value):
        if self.context["request"].user != value:
            raise ValidationError("You can't create a post for another user.")
        return value

    def validate_body(self, value: str) -> str:
        """
        Очищаем HTML/XSS. Возвращаем безопасную разметку.
        """
        if value is None:
            return value
        if not isinstance(value, str):
            raise ValidationError("Некорректный тип поля body.")
        cleaned = sanitize_html(value)
        if not cleaned.strip():
            # Не даём пустые/«вымытые до пустоты» сообщения
            raise ValidationError("Введите текст поста")
        return cleaned

    def validate_image(self, value):
        if value is None:
            return value
        try:
            validate_image_upload(value)
        except ValidationError:
            raise
        except Exception:
            raise ValidationError("Ошибка валидации изображения. Попробуйте другой файл.")
        return value
    
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        author = User.objects.get_object_by_public_id(rep["author"])
        rep["author"] = UserSerializer(author).data
        return rep
    
    def update(self, instance, validated_data):
        """
        - Меняем флаг edited
        - Если прислано image=None или пришёл новый файл -> корректно удаляем старый с диска
        """
        if not instance.edited:
            validated_data['edited'] = True

        image_in_payload = 'image' in validated_data

        if image_in_payload and (validated_data['image'] is None or validated_data['image'] == ''):
            delete_file_safely(instance.image)
            validated_data.pop('image', None)
            instance.image = None

        if image_in_payload and validated_data.get('image'):
            pass

        # Доп. защита: если body пришёл без вызова validate_body (например, partial update)
        if 'body' in validated_data and isinstance(validated_data['body'], str):
            validated_data['body'] = sanitize_html(validated_data['body'])

        instance = super().update(instance, validated_data)
        return instance
    
    def create(self, validated_data):
        # Доп. защита
        if 'body' in validated_data and isinstance(validated_data['body'], str):
            validated_data['body'] = sanitize_html(validated_data['body'])
        return super().create(validated_data)
    
    def get_liked(self, instance):
        request = self.context.get('request', None)
        if request is None or request.user.is_anonymous:
            return False
        return request.user.has_liked(instance)
    
    def get_likes_count(self, instance):
        return instance.liked_by.count()

    def get_comments_count(self, instance):
        return Comment.objects.filter(post=instance).count()

    class Meta:
        model = Post
        fields = ['id', 'author', 'body', 'edited', 'liked', 'likes_count', 'comments_count', 'created', 'updated', 'image', 'created_at']
        read_only_fields = ["edited"]
