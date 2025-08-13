# post/models.py
from django.db import models
from abstract.models import AbstractModel, AbstractManager
from django.utils import timezone
from comment.models import Comment
from .utils import delete_file_safely, sanitize_html  # ← добавили импорт

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

    def save(self, *args, **kwargs):
        """
        Дублируем защиту на уровне модели: перед сохранением очищаем HTML.
        Это страхует от обхода сериализатора.
        """
        if isinstance(self.body, str):
            self.body = sanitize_html(self.body)
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        Comment.objects.filter(post=self).delete()
        delete_file_safely(self.image)
        super().delete(*args, **kwargs)

    class Meta:
        db_table = "'post'"
