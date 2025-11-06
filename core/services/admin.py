# core/services/admin.py
from django.contrib import admin
from .models import Service


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'price', 'is_active', 'updated_at')
    list_filter = ('is_active',)
    search_fields = ('title', 'description')
    prepopulated_fields = {"slug": ("title",)}
