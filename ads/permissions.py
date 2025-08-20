# ads/permissions.py
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Разрешает чтение всем.
    Создавать/изменять/удалять могут только аутентифицированные пользователи,
    причем изменять/удалять — только владелец объекта (поле user/author).
    """

    def has_permission(self, request, view):
        # Чтение всем
        if request.method in permissions.SAFE_METHODS:
            return True
        # На не-SAFE методы — только аутентифицированным
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Чтение всем
        if request.method in permissions.SAFE_METHODS:
            return True
        # Владелец?
        owner = getattr(obj, 'user', None) or getattr(obj, 'author', None)
        return owner is not None and owner == request.user
