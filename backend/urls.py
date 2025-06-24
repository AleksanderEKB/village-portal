# backend/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NewsViewSet, UserViewSet
from auth.viewsets import RegisterViewSet, LoginViewSet, RefreshViewSet
from post.views import PostViewSet
from comment.views import CommentViewSet
from info.views import SocialViewSet
from rest_framework_nested.routers import NestedDefaultRouter

from ads.views import AdvertisementViewSet

router = DefaultRouter()
router.register(r'news', NewsViewSet, basename='news')
router.register(r'user', UserViewSet, basename='user')
router.register(r'auth/register', RegisterViewSet, basename='auth-register')
router.register(r'auth/login', LoginViewSet, basename='auth-login')
router.register(r'auth/refresh', RefreshViewSet, basename='auth-refresh')
router.register(r'post', PostViewSet, basename='post')
router.register(r'info/social', SocialViewSet, basename='info-social')
router.register(r'ads', AdvertisementViewSet, basename='ads')

post_router = NestedDefaultRouter(router, r'post', lookup='post')
post_router.register(r'comments', CommentViewSet, basename='post-comments')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(post_router.urls)),
]
