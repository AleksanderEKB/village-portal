# post/models.py
from django.db import models
from abstract.models import AbstractModel, AbstractManager
from django.utils import timezone
from comment.models import Comment

class PostManager(AbstractManager):
    pass

class Post(AbstractModel):
    author = models.ForeignKey(to="backend.User", on_delete=models.CASCADE, related_name="posts")
    body = models.TextField(max_length=4096)
    created_at = models.DateTimeField(default=timezone.now)
    edited = models.BooleanField(default=False)
    image = models.ImageField(upload_to='posts/', null=True, blank=True)

    objects = PostManager()
    
    def __str__(self):
        return f"{self.author.username}"
    
    def delete(self, *args, **kwargs):
        Comment.objects.filter(post=self).delete()
        super().delete(*args, **kwargs)

    class Meta:
        db_table = "'post'"
