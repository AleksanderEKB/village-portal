from django.db import models
from django.utils.text import slugify
from unidecode import unidecode

class Social(models.Model):
    title = models.CharField(max_length=100, verbose_name="Наименование службы")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    icon_name = models.CharField(max_length=64, verbose_name="Иконка (FontAwesome)", default='fa-info')
    slug = models.SlugField(unique=True, max_length=100, blank=True, verbose_name="Слаг")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(unidecode(self.title))
        super(Social, self).save(*args, **kwargs)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Социальная служба"
        verbose_name_plural = "Социальные службы"

class SocialPhone(models.Model):
    social = models.ForeignKey(Social, related_name='phones', on_delete=models.CASCADE)
    number = models.CharField(max_length=50, verbose_name="Телефон", blank=True, null=True)

    def __str__(self):
        return self.number or ""

    class Meta:
        verbose_name = "Телефон соцслужбы"
        verbose_name_plural = "Телефоны соцслужб"