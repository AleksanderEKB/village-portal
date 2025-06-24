from django.contrib import admin
from .models import Advertisement, AdvertisementImage


@admin.register(Advertisement)
class AdvertisementAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'created_at', 'category')  # Поля для отображения
    list_filter = ('title', 'created_at', 'category')  # Добавление фильтров
    search_fields = ('title', 'created_at', 'category')  # Поля для поиска
    prepopulated_fields = {'slug': ('title',)}  # Автоматическое заполнение slug на основе title
    date_hierarchy = 'created_at'  # Навигация по датам
    # readonly_fields = ('slug',)
    # Если нужно, можно скрыть slug вообще:
    # exclude = ('slug',)

@admin.register(AdvertisementImage)
class AdvertisementImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'advertisement', 'order')  # Поля для отображения
    list_filter = ('advertisement', 'order')  # Добавление фильтров
    search_fields = ('id', 'advertisement')  # Поля для поиска
