# core/common/exceptions.py
from django.db import IntegrityError
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Превращаем IntegrityError (дубль email/phone и т.п.) в понятный JSON 409,
    вместо HTML-страницы 500.
    """
    if isinstance(exc, IntegrityError):
        return Response(
            {'detail': 'Запись с такими данными уже существует.'},
            status=status.HTTP_409_CONFLICT
        )
    # остальное — стандартная обработка DRF (вернёт JSON по content negotiation)
    return exception_handler(exc, context)
