# ads/permissions.py
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Позволяет редактировать/удалять только владельцу, остальным только просмотр.
    """

    def has_object_permission(self, request, view, obj):
        # Только просмотр разрешён всем
        if request.method in permissions.SAFE_METHODS:
            return True
        # Только владелец может менять/удалять
        return obj.user == request.user
