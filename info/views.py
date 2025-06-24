from rest_framework import viewsets
from .models import Social, SocialPhone
from rest_framework.permissions import AllowAny
from .serializers import SocialSerializer
from django.shortcuts import get_object_or_404



class SocialViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Social.objects.all().order_by('?')
    serializer_class = SocialSerializer
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
    
