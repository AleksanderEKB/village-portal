# core/user/models.py
import uuid
from django.db import models

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.exceptions import ObjectDoesNotExist
from django.http import Http404

from core.abstract.models import AbstractManager, AbstractModel


class UserManager(BaseUserManager, AbstractManager):
    def get_object_by_public_id(self, public_id):
        try:
            instance = self.get(public_id=public_id)
            return instance
        except (ObjectDoesNotExist, ValueError, TypeError):
            return Http404

    def create_user(self, email, password=None, **kwargs):
        if email is None:
            raise TypeError("У пользователя должен быть email")
        if password is None:
            raise TypeError("У пользователя должен быть пароль")

        user = self.model(email=self.normalize_email(email), **kwargs)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **kwargs):
        if password is None:
            raise TypeError("У суперпользователя должен быть пароль")
        if email is None:
            raise TypeError("У суперпользователя должен быть email")

        user = self.create_user(email, password, **kwargs)
        user.is_superuser = True
        user.is_staff = True
        user.save(using=self._db)
        return user


class User(AbstractModel, AbstractBaseUser, PermissionsMixin):
    public_id = models.UUIDField(db_index=True, unique=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(db_index=True, unique=True)
    first_name = models.CharField(max_length=255, blank=True)
    last_name = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    created = models.DateTimeField(auto_now=True)
    updated = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # ← username убран

    objects = UserManager()

    def __str__(self):
        return self.email

    @property
    def name(self):
        return f"{self.first_name} {self.last_name}".strip()
