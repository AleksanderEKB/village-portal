from django.contrib import admin

from .models import Comment

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'post')
    list_filter = ('id', 'author')
    search_fields = ('author', 'post')
    date_hierarchy = ('created')
