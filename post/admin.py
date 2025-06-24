from django.contrib import admin

from .models import Post

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'body', 'created')  # Поля для отображения
    list_filter = ('author', 'created')  # Добавление фильтров
    search_fields = ('author','created')  # Поля для поиска
    date_hierarchy = 'created'  # Навигация по датам