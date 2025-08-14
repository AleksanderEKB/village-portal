# comment/views.py
from django.http.response import Http404
from rest_framework import status
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.exceptions import Throttled

from abstract.views import AbstractViewSet
from comment.models import Comment
from comment.serializers import CommentSerializer
from comment.permissions import CommentAuthorOrReadOnly


class RussianCommentThrottled(Throttled):
    default_detail = "Слишком много комментариев."
    extra_detail_singular = "Можно попробовать снова через {wait} секунду."
    extra_detail_plural = "Можно попробовать снова через {wait} секунд."


class CommentPagination(LimitOffsetPagination):
    default_limit = 4
    max_limit = 20


class CommentViewSet(AbstractViewSet):
    http_method_names = ("post", "get", "put", "patch", "delete")
    serializer_class = CommentSerializer
    pagination_class = CommentPagination
    permission_classes = (CommentAuthorOrReadOnly,)

    # Базовые троттлы (работают только если задан throttle_scope)
    throttle_classes = (ScopedRateThrottle,)

    def get_throttles(self):
        """
        Включаем троттлинг только для создания комментария.
        Для остальных действий троттлинг не применяется.
        """
        if getattr(self, "action", None) == "create":
            # динамически задаем скоуп для текущего экшена
            self.throttle_scope = "comment-create"
            return [throttle() for throttle in self.throttle_classes]
        # для остальных экшенов — как у родителя (без троттлинга, т.к. нет throttle_scope)
        return super().get_throttles()

    def throttled(self, request, wait):
        """
        Переопределяем, чтобы вернуть русскоязычное сообщение вместо стандартного DRF.
        """
        raise RussianCommentThrottled(wait=wait)

    def get_queryset(self):
        if self.request.user.is_superuser:
            return Comment.objects.all().order_by("-created")

        post_pk = self.kwargs.get("post_pk")
        if not post_pk:
            raise Http404
        return Comment.objects.filter(post__public_id=post_pk).order_by("-created")

    def get_object(self):
        obj = Comment.objects.get_object_by_public_id(self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)  # объектная проверка прав
        return obj

    def perform_create(self, serializer):
        user = self.request.user
        post_pk = self.kwargs.get("post_pk")
        if not post_pk:
            raise Http404
        from post.models import Post

        post = Post.objects.get_object_by_public_id(post_pk)
        serializer.save(author=user, post=post)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
