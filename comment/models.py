# comment/models.py
from django.db import models
from abstract.models import AbstractModel, AbstractManager
from common.sanitizers import sanitize_html

class CommentManager(AbstractManager):
    pass

class Comment(AbstractModel):
    post = models.ForeignKey("post.Post", on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey("backend.User", on_delete=models.CASCADE)
    body = models.TextField()
    edited = models.BooleanField(default=False)

    objects = CommentManager()

    def clean(self):
        # Гарантируем очистку даже вне DRF (админка, shell, сигналы)
        self.body = sanitize_html(self.body or "")

    def save(self, *args, **kwargs):
        self.clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.author.username
