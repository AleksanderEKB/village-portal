# core/posts/viewsets.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import IntegrityError

from .models import Post, PostLike
from .serializers import PostSerializer, CommentSerializer


class PostPermissions(permissions.BasePermission):
    """
    - Любой может читать (list/retrieve)
    - Только авторизованные могут создавать/менять/удалять/лайкать/комментировать
    - Изменять/удалять пост может только автор либо суперпользователь
    - Лайкать и комментировать могут любые авторизованные пользователи (не только автор)
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        # create/like/comment — нужен логин
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj: Post):
        if request.method in permissions.SAFE_METHODS:
            return True

        # Разрешаем любым авторизованным пользователям лайкать и комментировать
        if getattr(view, 'action', None) in ('toggle_like', 'comments'):
            return request.user and request.user.is_authenticated

        # Изменение/удаление — только автор или суперпользователь
        return request.user.is_superuser or obj.author_id == request.user.id


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    lookup_field = 'public_id'
    queryset = Post.objects.select_related('author').prefetch_related('likes', 'comments')
    permission_classes = (PostPermissions,)

    def get_permissions(self):
        # Для toggle-like/comments остаются те же правила из PostPermissions
        return super().get_permissions()

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        return {**ctx, 'request': self.request}

    @action(detail=True, methods=['post'], url_path='toggle-like')
    def toggle_like(self, request, public_id=None):
        post = self.get_object()
        user = request.user
        if not user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=401)

        like_qs = PostLike.objects.filter(post_id=post.id, user_id=user.id)
        if like_qs.exists():
            like_qs.delete()
            liked = False
        else:
            try:
                PostLike.objects.create(post_id=post.id, user_id=user.id)
                liked = True
            except IntegrityError:
                # На случай гонки — считаем, что уже лайкнут
                liked = True

        # ВАЖНО: считаем лайки свежим запросом, а не через post.likes.count(),
        # т.к. prefetch_related кэширует related-менеджер и даёт устаревшее значение.
        likes_count = PostLike.objects.filter(post_id=post.id).count()

        return Response(
            {'liked': liked, 'likes_count': likes_count},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['get', 'post'], url_path='comments')
    def comments(self, request, public_id=None):
        post = self.get_object()
        if request.method == 'GET':
            qs = post.comments.select_related('author').all().order_by('created')
            data = CommentSerializer(qs, many=True, context={'request': request}).data
            return Response(data, status=200)

        # POST
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=401)
        serializer = CommentSerializer(
            data=request.data,
            context={'request': request, 'post': post}
        )
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()
        return Response(CommentSerializer(obj, context={'request': request}).data, status=201)
