from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name','email', 'phone_number', 'created', 'is_superuser', 'is_active')
    list_filter = ('first_name', 'last_name', 'email','phone_number')
    search_fields = ('first_name', 'last_name', 'email', 'phone_number')
    date_hierarchy = ('created')