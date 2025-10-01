from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.http import Http404

from core.abstract.viewsets import AbstractViewSet
from core.user.serializers import UserSerializer
from core.user.models import User


class UserViewSet(AbstractViewSet):
    http_method_names = ('patch', 'get', 'delete')  # включаем delete
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer
    lookup_field = 'public_id'  # в роуте ключ будет 'public_id'

    def get_queryset(self):
        if self.request.user.is_superuser:
            return User.objects.all()
        return User.objects.exclude(is_superuser=True)

    # аккуратно читаем kwarg по lookup_field (а не 'pk')
    def get_object(self):
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        public_id = self.kwargs.get(lookup_url_kwarg)
        if not public_id:
            raise Http404

        obj = User.objects.get_object_by_public_id(public_id)
        self.check_object_permissions(self.request, obj)
        return obj

    # если где-то использовали get_objects — оставим алиас
    def get_objects(self):
        return self.get_object()

    def destroy(self, request, *args, **kwargs):
        obj = self.get_object()
        # Удалять можно:
        # - самого себя
        # - либо если текущий пользователь — суперпользователь
        if not (request.user.is_superuser or obj.pk == request.user.pk):
            raise PermissionDenied("Вы не можете удалить этот профиль.")
        self.perform_destroy(obj)
        return Response(status=status.HTTP_204_NO_CONTENT)
