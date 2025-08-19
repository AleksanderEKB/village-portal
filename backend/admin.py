from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'created', 'is_superuser', 'is_active')
    list_filter = ('username', 'email')
    search_fields = ('username', 'email')
    date_hierarchy = ('created')