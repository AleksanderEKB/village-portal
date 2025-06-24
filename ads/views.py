# ads/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404

from .models import Advertisement, AdvertisementImage
from .serializers import (
    AdvertisementSerializer,
    AdvertisementCreateSerializer,
)


class AdvertisementViewSet(viewsets.ModelViewSet):
    queryset = Advertisement.objects.all().order_by('-created_at')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'create':
            return AdvertisementCreateSerializer
        return AdvertisementSerializer

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
