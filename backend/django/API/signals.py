from django.db.models.signals import post_delete
from django.dispatch import receiver
import os
from .models import ProductImage, Products, User

@receiver(post_delete, sender=ProductImage)
def delete_image_file(sender, instance, **kwargs):
    if instance.image:
        if os.path.isfile(instance.image.path):
            os.remove(instance.image.path)
            
@receiver(post_delete, sender=Products)
def delete_product_images(sender, instance, **kwargs):
    for image in instance.images.all():
        if image.image and os.path.isfile(image.image.path):
            os.remove(image.image.path)

@receiver(post_delete, sender=User)
def delete_product_images(sender, instance, **kwargs):
    for image in instance.images.all():
        if image.image and os.path.isfile(image.image.path):
            os.remove(image.image.path)
