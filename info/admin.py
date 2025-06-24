from django.contrib import admin
from .models import Social, SocialPhone


@admin.register(Social)
class SocialAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'icon_name', 'created_at', 'slug')  # Поля для отображения
    list_filter = ('title', 'created_at')  # Добавление фильтров
    search_fields = ('title', 'created_at')  # Поля для поиска
    prepopulated_fields = {'slug': ('title',)}  # Автоматическое заполнение slug на основе title
    date_hierarchy = 'created_at'  # Навигация по датам


@admin.register(SocialPhone)
class SocialPhoneAdmin(admin.ModelAdmin):
    list_display = ('id', 'social', 'number')  # Поля для отображения
    list_filter = ('social', 'number')  # Добавление фильтров
    search_fields = ('social', 'number')  # Поля для поиска
