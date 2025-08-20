# ads/signals.py
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from .models import Advertisement, AdvertisementImage


def _safe_delete_file(file_field):
    """
    Безопасно удаляет файл из стораджа, не трогая модель.
    Используем только когда уверены, что это "старый" файл.
    """
    try:
        if file_field and getattr(file_field, "name", None):
            storage = file_field.storage
            name = file_field.name
            # delete(save=False) корректно работает и для локального диска, и для S3‑подобных стораджей
            file_field.delete(save=False)
            # На некоторых стораджах .delete() делегирует в storage.delete(name),
            # отдельного вызова storage.delete(name) не требуется.
    except Exception:
        # Ничего не падаем: файловая система/сторанд может быть недоступна.
        # Логирование добавьте по месту (sentry/logger), если нужно.
        pass


@receiver(pre_save, sender=Advertisement)
def auto_delete_old_main_image_on_change(sender, instance: Advertisement, **kwargs):
    """
    Перед сохранением объявления: если main_image меняется (или очищается),
    удаляем предыдущий файл из стораджа.
    """
    if not instance.pk:
        # Новый объект — старого файла нет
        return
    try:
        old_instance = Advertisement.objects.get(pk=instance.pk)
    except Advertisement.DoesNotExist:
        return

    old_file = old_instance.main_image
    new_file = instance.main_image

    # Если раньше файла не было — нечего удалять
    if not old_file:
        return

    # Удаляем, если файл очищен или реально заменён другим
    # Сравниваем по name, потому что сам File/Field может быть другим объектом
    if not new_file or old_file.name != getattr(new_file, "name", None):
        _safe_delete_file(old_file)


@receiver(pre_save, sender=AdvertisementImage)
def auto_delete_old_image_on_change(sender, instance: AdvertisementImage, **kwargs):
    """
    Перед сохранением дополнительного изображения: при замене файла удаляем старый.
    """
    if not instance.pk:
        return
    try:
        old_instance = AdvertisementImage.objects.get(pk=instance.pk)
    except AdvertisementImage.DoesNotExist:
        return

    old_file = old_instance.image
    new_file = instance.image

    if not old_file:
        return

    if not new_file or old_file.name != getattr(new_file, "name", None):
        _safe_delete_file(old_file)


@receiver(post_delete, sender=Advertisement)
def delete_main_image_file(sender, instance: Advertisement, **kwargs):
    """
    После удаления объявления — удалить файл основного изображения.
    Доп. изображения удалятся каскадно через AdvertisementImage.post_delete.
    """
    if instance.main_image:
        # save=False — чтобы не было повторного сохранения модели
        instance.main_image.delete(save=False)


@receiver(post_delete, sender=AdvertisementImage)
def delete_image_file(sender, instance: AdvertisementImage, **kwargs):
    """
    После удаления доп. изображения — удалить файл.
    """
    if instance.image:
        instance.image.delete(save=False)
