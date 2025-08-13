# post/signals.py
from django.db.models.signals import pre_save, post_delete
from django.dispatch import receiver
from .models import Post
from .utils import delete_file_safely

@receiver(pre_save, sender=Post)
def delete_old_image_on_change(sender, instance: Post, **kwargs):
    """
    Перед сохранением проверяем, меняется ли файл изображения:
    - если был старый и он отличается от нового -> удаляем старый файл.
    - если новый None (очистка) -> удаляем старый файл.
    """
    if not instance.pk:
        return
    try:
        old = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return

    old_file = getattr(old, "image", None)
    new_file = getattr(instance, "image", None)

    # Если файл удалили или заменили — сносим старый
    if old_file and (not new_file or old_file.name != getattr(new_file, "name", None)):
        delete_file_safely(old_file)


@receiver(post_delete, sender=Post)
def delete_image_file_on_delete(sender, instance: Post, **kwargs):
    """
    После удаления модели удаляем файл-изображение с диска.
    """
    delete_file_safely(getattr(instance, "image", None))
