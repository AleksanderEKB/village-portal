# backend/views.py
from rest_framework import viewsets
from .models import *
from .serializers import *
from post.models import Post
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from abstract.views import AbstractViewSet
from rest_framework.response import Response
from rest_framework import status

class NewsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = News.objects.all().order_by('-created_at')
    serializer_class = NewsSerializer
    lookup_field = 'slug'
    permission_classes = (AllowAny,)

    def get_object(self):
        queryset = self.get_queryset()
        slug = self.kwargs.get('slug')
        return get_object_or_404(queryset, slug=slug)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class UserViewSet(AbstractViewSet):
    http_method_names = ('patch', 'get', 'delete')
    serializer_class = UserSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return User.objects.exclude(is_superuser=True)
    
    def get_object(self):
        obj = User.objects.get_object_by_public_id(self.kwargs['pk'])
        self.check_object_permissions(self.request, obj)
        return obj

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Удаляем все посты пользователя и связанные с ними комментарии
        posts = Post.objects.filter(author=instance)
        for post in posts:
            post.delete()
        # Удаляем все лайки пользователя
        instance.posts_liked.clear()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
