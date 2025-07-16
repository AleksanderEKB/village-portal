# ads/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404

from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .permissions import IsOwnerOrReadOnly

from .models import Advertisement, AdvertisementImage
from .serializers import (
    AdvertisementSerializer,
    AdvertisementCreateSerializer,
)

class AdvertisementViewSet(viewsets.ModelViewSet):
    queryset = Advertisement.objects.all().select_related('user').prefetch_related('images').order_by('-created_at')
    serializer_class = AdvertisementSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'create':
            return AdvertisementCreateSerializer
        return AdvertisementSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        # В личном кабинете (параметр ?mine=1) — все свои объявления
        mine = self.request.query_params.get('mine')
        if mine and user.is_authenticated:
            return qs.filter(user=user)

        # На главной и при просмотре чужих профилей — только активные
        if self.action in ['list', 'retrieve']:
            if not user.is_authenticated:
                qs = qs.filter(is_active=True)
            else:
                qs = qs.filter(is_active=True) | qs.filter(user=user)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            return Response({'detail': 'Вы не можете редактировать это объявление.'},
                            status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            return Response({'detail': 'Вы не можете удалить это объявление.'},
                            status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['delete'], url_path='images/(?P<image_id>[^/.]+)/delete', permission_classes=[permissions.IsAuthenticated])
    def delete_image(self, request, slug=None, image_id=None):
        image = get_object_or_404(AdvertisementImage, pk=image_id, advertisement__slug=slug)
        ad = image.advertisement
        if ad.user != request.user:
            return Response({'detail': 'Вы не можете удалить это изображение.'}, status=status.HTTP_403_FORBIDDEN)
        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='switch-status')
    def switch_status(self, request, slug=None):
        ad = self.get_object()
        if ad.user != request.user:
            return Response({'detail': 'Нет доступа'}, status=status.HTTP_403_FORBIDDEN)
        ad.is_active = not ad.is_active
        ad.save(update_fields=['is_active'])
        return Response({'is_active': ad.is_active})
