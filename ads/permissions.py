from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Позволяет редактировать/удалять только владельцу объекта (user/author), остальным только просмотр.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Проверяем наличие user или author
        owner = getattr(obj, 'user', None) or getattr(obj, 'author', None)
        return owner == request.user
