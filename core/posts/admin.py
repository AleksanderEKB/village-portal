# core/posts/admin.py
from django.contrib import admin
from .models import Post, PostLike, Comment

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'created')
    list_select_related = ('author',)

@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'post', 'created')
    list_select_related = ('user', 'post')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'post', 'created')
    list_select_related = ('author', 'post')
