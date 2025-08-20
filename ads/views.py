# ads/views.py — включаем троттлинг только на create + локализуем 429
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.db.models import Q

from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.exceptions import Throttled
from .permissions import IsOwnerOrReadOnly

from .models import Advertisement, AdvertisementImage
from .serializers import (
    AdvertisementSerializer,
    AdvertisementCreateSerializer,
)

class AdvertisementViewSet(viewsets.ModelViewSet):
    queryset = (
        Advertisement.objects
        .all()
        .select_related('user')
        .prefetch_related('images')
        .order_by('-created_at')
    )
    serializer_class = AdvertisementSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'create':
            return AdvertisementCreateSerializer
        return AdvertisementSerializer

    # 👇 Включаем троттлинг только на create с отдельным скоупом
    def get_throttles(self):
        if getattr(self, 'action', None) == 'create':
            self.throttle_scope = 'ads-create'
            return [ScopedRateThrottle()]
        # для остальных действий — без троттлинга по скоупам
        return []

    # 👇 Локализуем ответ при 429
    def throttled(self, request, wait):
        raise Throttled(
            wait=wait,
            detail={'detail': f'Слишком много попыток создания объявления. Повторите через {int(wait)} сек.'}
        )

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        mine = self.request.query_params.get('mine')
        if mine and user.is_authenticated:
            return qs.filter(user=user)

        if self.action in ['list', 'retrieve']:
            if user.is_authenticated:
                qs = qs.filter(Q(is_active=True) | Q(user=user))
            else:
                qs = qs.filter(is_active=True)
        return qs.distinct()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        return super().destroy(request, *args, **kwargs)

    @action(
        detail=True,
        methods=['delete'],
        url_path='images/(?P<image_id>[^/.]+)/delete',
        permission_classes=[IsAuthenticated]
    )
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
        ad.is_active = not ad.is_active
        ad.save(update_fields=['is_active'])
        return Response({'is_active': ad.is_active})
