# ads/models.py
from django.conf import settings
from django.db import models
from django.utils.text import slugify
from unidecode import unidecode

class Category(models.TextChoices):
    SELL = "sell", "Продаю"
    BUY = "buy", "Куплю"
    FREE = "free", "Отдам даром"
    SERVICE = "service", "Услуги"
    SUNDRY = "sundry", "Разное"
    HIRE = "hire", "Нужна услуга/работника"
    LOSS = "loss", "Потеряшки"

class Advertisement(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="advertisements"
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=Category.choices)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)
    contact_phone = models.CharField(max_length=32, blank=True)
    contact_email = models.EmailField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    main_image = models.ImageField(upload_to='ads/', blank=True, null=True)
    slug = models.SlugField(unique=True, max_length=100, blank=True, verbose_name="Слаг")

    def save(self, *args, **kwargs):
        creating = self._state.adding
        if creating:
            super().save(*args, **kwargs)
            self.slug = f"{slugify(unidecode(self.title))}-{self.id}"
            super().save(update_fields=['slug'])
        else:
            super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Объявление"
        verbose_name_plural = "Объявления"

class AdvertisementImage(models.Model):
    advertisement = models.ForeignKey(Advertisement, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='ads/')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name = "Объявление доп. изображене"
        verbose_name_plural = "Объявления доп. изображения"
