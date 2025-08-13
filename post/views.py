# post/views.py
import math
import time

from django.core.cache import cache
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import Throttled

from abstract.views import AbstractViewSet
from post.models import Post
from post.serializers import PostSerializer


class RussianThrottled(Throttled):
    """
    Локализованный Throttled: DRF всегда добавляет к detail «хвост»
    с временем ожидания из extra_detail_*. Здесь делаем его по‑русски
    и с маленькой буквы, чтобы фраза красиво продолжала detail.
    """
    default_detail = "Запрос ограничен."
    extra_detail_singular = "будет доступно через {wait} секунду."
    extra_detail_plural = "будет доступно через {wait} секунд."


class PostViewSet(AbstractViewSet):
    http_method_names = ('post', 'get', 'put', 'delete')
    serializer_class = PostSerializer

    # ---- НАСТРОЙКИ ТРОТТЛИНГА СОЗДАНИЯ ПОСТОВ ----
    _CREATE_RATE = 5          # сколько действий
    _CREATE_PERIOD_SEC = 60   # за какой период (в секундах)

    def _enforce_create_throttle(self, user_id: int) -> None:
        """
        Простой скользящий лимит (sliding window) на создание постов.
        Храним в Django cache список таймстемпов за последнюю минуту.
        При превышении — бросаем 429 с корректным wait.
        """
        key = f"throttle:post_create:{user_id}"
        now = time.time()

        timestamps = cache.get(key) or []
        window_start = now - self._CREATE_PERIOD_SEC
        timestamps = [ts for ts in timestamps if ts > window_start]

        if len(timestamps) >= self._CREATE_RATE:
            oldest = min(timestamps)
            wait = self._CREATE_PERIOD_SEC - (now - oldest)
            # В detail ставим запятую — DRF добавит пробел и extra_detail_*:
            # «Не больше 5 постов в минуту, будет доступно через N секунд.»
            raise RussianThrottled(
                detail=f"Не больше {self._CREATE_RATE} постов в минуту,",
                wait=math.ceil(wait),
            )

        timestamps.append(now)
        cache.set(key, timestamps, timeout=self._CREATE_PERIOD_SEC)

    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(PostViewSet, self).get_permissions()

    def get_queryset(self):
        return Post.objects.all()

    def get_object(self):
        obj = Post.objects.get_object_by_public_id(self.kwargs['pk'])
        self.check_object_permissions(self.request, obj)
        return obj

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            return Response({"error": "Вы не можете удалить чужой пост."}, status=status.HTTP_403_FORBIDDEN)
        instance.delete()

    def create(self, request, *args, **kwargs):
        # ---- ПРОВЕРКА ТРОТТЛИНГА ПЕРЕД ВАЛИДАЦИЕЙ/СОХРАНЕНИЕМ ----
        self._enforce_create_throttle(request.user.id)

        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(methods=['post'], detail=True)
    def like(self, request, *args, **kwargs):
        post = self.get_object()
        user = self.request.user

        if post.author == user:
            return Response({"error": "Свои посты не лайкаем"}, status=status.HTTP_400_BAD_REQUEST)

        user.like(post)
        serializer = self.serializer_class(post, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True)
    def remove_like(self, request, *args, **kwargs):
        post = self.get_object()
        user = self.request.user

        if post.author == user:
            return Response({"error": "Вы не можете удалять чужие лайки."}, status=status.HTTP_400_BAD_REQUEST)

        user.remove_like(post)
        serializer = self.serializer_class(post, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        post = self.get_object()
        if post.author != self.request.user:
            return Response({"error": "Вы не можете редактировать чужой пост."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)
