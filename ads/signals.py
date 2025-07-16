from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import Advertisement, AdvertisementImage

@receiver(post_delete, sender=Advertisement)
def delete_main_image_file(sender, instance, **kwargs):
    if instance.main_image:
        instance.main_image.delete(False)

@receiver(post_delete, sender=AdvertisementImage)
def delete_image_file(sender, instance, **kwargs):
    if instance.image:
        instance.image.delete(False)
