# core/posts/serializers.py
from rest_framework import serializers
from core.user.models import User
from .models import Post, PostLike, Comment
from .utils import make_excerpt


class AuthorShortSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='public_id', read_only=True, format='hex')
    avatar = serializers.ImageField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'avatar', 'email')


class CommentSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='public_id', read_only=True, format='hex')
    author = AuthorShortSerializer(read_only=True)
    created = serializers.DateTimeField(read_only=True)
    updated = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'author', 'content', 'created', 'updated')

    def create(self, validated_data):
        request = self.context['request']
        post = self.context['post']
        return Comment.objects.create(post=post, author=request.user, **validated_data)


class PostSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='public_id', read_only=True, format='hex')
    author = AuthorShortSerializer(read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    short_content = serializers.SerializerMethodField()
    created = serializers.DateTimeField(read_only=True)
    updated = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Post
        fields = (
            'id', 'author', 'content', 'short_content', 'image',
            'likes_count', 'is_liked', 'comments_count',
            'created', 'updated'
        )

    def get_likes_count(self, obj: Post) -> int:
        return obj.likes.count()

    def get_comments_count(self, obj: Post) -> int:
        return obj.comments.count()

    def get_is_liked(self, obj: Post) -> bool:
        request = self.context.get('request')
        if not request or request.user.is_anonymous:
            return False
        return obj.likes.filter(user=request.user).exists()

    def get_short_content(self, obj: Post) -> str:
        return make_excerpt(obj.content or "", 100)

    def create(self, validated_data):
        request = self.context['request']
        return Post.objects.create(author=request.user, **validated_data)

    def update(self, instance: Post, validated_data):
        """
        Разрешаем обновлять ТОЛЬКО текст (content).
        Любые попытки изменить/очистить image игнорируем.
        """
        validated_data.pop('image', None)
        return super().update(instance, validated_data)
