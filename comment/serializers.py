# comment/serializers.py
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from abstract.serializers import AbstractSerializer
from backend.models import User
from backend.serializers import UserSerializer
from comment.models import Comment
from post.models import Post
from common.sanitizers import sanitize_html


class CommentSerializer(AbstractSerializer):
    author = serializers.SlugRelatedField(queryset=User.objects.all(), slug_field='public_id', required=False)
    post = serializers.SlugRelatedField(queryset=Post.objects.all(), slug_field='public_id', required=False)

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        author = User.objects.get_object_by_public_id(rep["author"])
        rep["author"] = UserSerializer(author).data
        return rep

    def validate_post(self, value):
        if self.instance:
            return self.instance.post
        return value

    def validate_body(self, value: str) -> str:
        return sanitize_html(value or "")

    def create(self, validated_data):
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Объектные права уже проверены пермишеном в ViewSet
        if not instance.edited:
            validated_data['edited'] = True

        if 'body' in validated_data:
            validated_data['body'] = sanitize_html(validated_data['body'] or "")

        return super().update(instance, validated_data)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'body', 'edited', 'created', 'updated']
        read_only_fields = ["edited", "author", "post"]
