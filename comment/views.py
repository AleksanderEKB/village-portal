# comment/views.py
from django.http.response import Http404

from rest_framework.response import Response
from rest_framework import status

from abstract.views import AbstractViewSet
from comment.models import Comment
from comment.serializers import CommentSerializer
from auth.permissions import UserPermission
from rest_framework.pagination import LimitOffsetPagination

class CommentPagination(LimitOffsetPagination):
    default_limit = 4
    max_limit = 20


class CommentViewSet(AbstractViewSet):
    http_method_names = ('post', 'get', 'put', 'patch', 'delete')
    permission_classes = (UserPermission,)
    serializer_class = CommentSerializer
    pagination_class = CommentPagination


    def get_queryset(self):
        if self.request.user.is_superuser:
            return Comment.objects.all()
        
        post_pk = self.kwargs['post_pk']
        if post_pk is None:
            return Http404
        queryset = Comment.objects.filter(post__public_id=post_pk).order_by('-created')  # последние первыми
        return queryset

        return queryset
    
    def get_object(self):
        obj = Comment.objects.get_object_by_public_id(self.kwargs['pk'])
        self.check_object_permissions(self.request, obj)

        return obj
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    
