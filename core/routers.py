# core/routers.py
from django.urls import path
from rest_framework import routers
from core.user.viewsets import UserViewSet
from core.auth.viewsets import RegisterViewSet, LoginViewSet, RefreshViewSet
from core.auth.viewsets.verify_email import VerifyEmailView
from core.auth.viewsets.password_reset import PasswordResetRequestView, PasswordResetConfirmView


router = routers.DefaultRouter()

router.register(r'user', UserViewSet, basename='user')
router.register(r'auth/register', RegisterViewSet, basename='auth-register')
router.register(r'auth/login', LoginViewSet, basename='auth-login')
router.register(r'auth/refresh', RefreshViewSet, basename='auth-refresh')

urlpatterns = [
    *router.urls,
    path('auth/verify-email/<uuid:token>/', VerifyEmailView.as_view(), name='auth-verify-email'),
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='auth-password-reset'),
    path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='auth-password-reset-confirm'),
]
