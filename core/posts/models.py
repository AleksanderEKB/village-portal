# core/posts/models.py
import uuid
from django.db import models
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.http import Http404

from core.abstract.models import AbstractModel, AbstractManager  # как в user.models
from core.user.models import User


class PostManager(AbstractManager):
    def get_object_by_public_id(self, public_id):
        try:
            return self.get(public_id=public_id)
        except (ObjectDoesNotExist, ValueError, TypeError):
            raise Http404


class Post(AbstractModel):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField(blank=True)
    image = models.ImageField(upload_to='posts/', null=True, blank=True)

    objects = PostManager()

    class Meta:
        ordering = ['-created']

    def __str__(self):
        return f'Post({self.pk}) by {self.author.email}'


class PostLike(AbstractModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='post_likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')

    class Meta:
        unique_together = [('user', 'post')]
        ordering = ['-created']

    def __str__(self):
        return f'Like u={self.user_id} p={self.post_id}'


class Comment(AbstractModel):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()

    class Meta:
        ordering = ['created']

    def __str__(self):
        return f'Comment({self.pk})'
