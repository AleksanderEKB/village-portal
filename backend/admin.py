from django.contrib import admin
from .models import News, User


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'created_at', 'slug')  # Поля для отображения
    list_filter = ('title', 'created_at')  # Добавление фильтров
    search_fields = ('title', 'content')  # Поля для поиска
    prepopulated_fields = {'slug': ('title',)}  # Автоматическое заполнение slug на основе title
    date_hierarchy = 'created_at'  # Навигация по датам

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'created', 'is_superuser', 'is_active')
    list_filter = ('username', 'email')
    search_fields = ('username', 'email')
    date_hierarchy = ('created')