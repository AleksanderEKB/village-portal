# comment/models.py
from django.db import models
from abstract.models import AbstractModel, AbstractManager

class CommentManager(AbstractManager):
    pass

class Comment(AbstractModel):
    post = models.ForeignKey("post.Post", on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey("backend.User", on_delete=models.CASCADE)
    body = models.TextField()
    edited = models.BooleanField(default=False)

    objects = CommentManager()

    def __str__(self):
        return self.author.username
