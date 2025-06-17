import os
from restaurant.models import MenuItem  # adjust to your app
from django.core.files import File
from django.conf import settings

MEDIA_DIR = os.path.join(settings.BASE_DIR, 'media')

for item in MenuItem.objects.all():
    if item.image:
        local_path = os.path.join(MEDIA_DIR, item.image.name)

        if os.path.exists(local_path):
            with open(local_path, 'rb') as f:
                print(f"Re-saving {item.name} -> {item.image.name}")
                # This triggers Cloudinary to re-upload and track it correctly
                item.image.save(item.image.name, File(f), save=True)
