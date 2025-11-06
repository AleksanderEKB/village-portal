# core/services/models.py
from django.db import models
from django.utils.text import slugify
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile


def service_image_upload_to(instance, filename):
    return f"services/{instance.slug or 'service'}/{filename}"


class Service(models.Model):
    title = models.CharField('Название', max_length=255)
    slug = models.SlugField('Слаг', max_length=255, unique=True, blank=True)
    image = models.ImageField('Изображение', upload_to=service_image_upload_to, blank=True, null=True)
    description = models.TextField('Описание')
    price = models.DecimalField('Цена', max_digits=10, decimal_places=2)
    is_active = models.BooleanField('Активна', default=True)
    created_at = models.DateTimeField('Создано', auto_now_add=True)
    updated_at = models.DateTimeField('Обновлено', auto_now=True)

    class Meta:
        verbose_name = 'Услуга'
        verbose_name_plural = 'Услуги'
        ordering = ['title']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # автогенерация slug при отсутствии
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Service.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug

        super().save(*args, **kwargs)

        # Приведение изображения к стандартному размеру (например, 800x600)
        if self.image:
            try:
                img = Image.open(self.image)
                img = img.convert('RGB')
                target_size = (1024, 1024)  # стандартный размер
                img = img.resize(target_size, Image.Resampling.LANCZOS)

                buffer = BytesIO()
                img.save(buffer, format='JPEG', quality=85)
                buffer.seek(0)

                # перезаписываем файл
                file_name = self.image.name.split('/')[-1]
                self.image.save(file_name, ContentFile(buffer.read()), save=False)

                super().save(update_fields=['image'])
            except Exception:
                # в случае проблем с обработкой изображения — просто игнорируем
                pass
