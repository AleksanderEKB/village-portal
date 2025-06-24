# post/serializers.py
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from abstract.serializers import AbstractSerializer
from backend.serializers import UserSerializer
from post.models import Post
from backend.models import User
from comment.models import Comment  # Импортируем модель комментариев

class PostSerializer(AbstractSerializer):
    author = serializers.SlugRelatedField(queryset=User.objects.all(), slug_field='public_id')
    liked = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()  # Добавляем поле для подсчета комментариев
    image = serializers.ImageField(required=False, allow_null=True)

    def validate_author(self, value):
        if self.context["request"].user != value:
            raise ValidationError("You can't create a post for another user.")
        return value
    
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        author = User.objects.get_object_by_public_id(rep["author"])
        rep["author"] = UserSerializer(author).data
        return rep
    
    def update(self, instance, validated_data):
        if not instance.edited:
            validated_data['edited'] = True

        if 'image' in validated_data:
            if validated_data['image'] is None or validated_data['image'] == '':
                validated_data.pop('image')
                instance.image = None

        instance = super().update(instance, validated_data)

        return instance
    
    def get_liked(self, instance):
        request = self.context.get('request', None)
        if request is None or request.user.is_anonymous:
            return False
        return request.user.has_liked(instance)
    
    def get_likes_count(self, instance):
        return instance.liked_by.count()

    def get_comments_count(self, instance):  # Метод для подсчета комментариев
        return Comment.objects.filter(post=instance).count()

    class Meta:
        model = Post
        fields = ['id', 'author', 'body', 'edited', 'liked', 'likes_count', 'comments_count', 'created', 'updated', 'image', 'created_at']
        read_only_fields = ["edited"]
