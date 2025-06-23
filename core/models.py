from django.db import models
from django.contrib.auth.models import User
import uuid
from django.utils import timezone
from django.core.exceptions import ValidationError
from datetime import timedelta
import cloudinary
import cloudinary.uploader
from django.db.models.signals import pre_delete, post_save
from django.dispatch import receiver
from django.core.files.storage import default_storage
from django.conf import settings


def generate_uuid():
    return str(uuid.uuid4())


# Create your models here.


class BaseMultiTenantModel(models.Model):
    class Meta:
        abstract = True  # Ensure this class isn't created as a model

    @classmethod
    def for_user(cls, user):
        if user.is_superuser:
            return cls.objects.all()
        return cls.objects.filter(system__owner=user)


class System(models.Model):
    """Core system model for multi-tenant applications"""

    SYSTEM_CATEGORIES = [
        ("restaurant", "Restaurant"),
        ("supermarket", "Supermarket"),
    ]

    # 🔑 Core Identifiers
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(unique=True, editable=False, default=uuid.uuid4)
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="owned_systems"
    )
    category = models.CharField(max_length=50, choices=SYSTEM_CATEGORIES)
    description = models.TextField(blank=True)

    # 🌐 Domain & Access Control
    subdomain = models.CharField(max_length=100, unique=True, null=True, blank=True)
    custom_domain = models.CharField(max_length=255, unique=True, null=True, blank=True)
    ssl_enabled = models.BooleanField(default=False)
    is_public = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    # 📍 Location Information
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    custom_link = models.URLField(max_length=500, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    # 🎨 Public Profile Information
    logo = models.ImageField(upload_to="public/logos/", null=True, blank=True)
    public_title = models.CharField(max_length=200, blank=True, null=True)
    public_description = models.TextField(blank=True, null=True)
    primary_color = models.CharField(max_length=7, default="#000000", null=True)
    secondary_color = models.CharField(max_length=7, default="#FFFFFF", null=True)
    email = models.EmailField(blank=True, null=True)
    whatsapp_number = models.CharField(max_length=20, blank=True, null=True)

    # 🔗 Social Media Links (stored as JSON)
    social_links = models.JSONField(
        default=dict,
        blank=True,
        help_text="""Format: {
        "facebook": "url",
        "instagram": "url",
        "twitter": "url",
            "youtube": "url",
        "tiktok": "url"
    }""",
    )
    design_settings = models.JSONField(
        default=dict,
        blank=True,
        help_text="""Format: {
    "primaryColor": "#00bfff",
    "secondaryColor": "#ffffff",
    "background": "#ffffff",
    "foreground": "#0a0a0a",
    "border": "#e5e5e5",
    "radius": "0.5rem"
    }""",
    )

    # 🕒 Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["owner"]),
            models.Index(fields=["category"]),
            models.Index(fields=["is_active"]),
            models.Index(fields=["is_public"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.category})"

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    def get_location_link(self):
        if self.custom_link:
            return self.custom_link
        if self.latitude is not None and self.longitude is not None:
            return f"https://www.google.com/maps?q={self.latitude},{self.longitude}"
        return None

    def delete(self, *args, **kwargs):
        delete_cloudinary_image(self.logo)
        super().delete(*args, **kwargs)


@receiver(post_save, sender=System)
def update_system_logo(sender, instance, **kwargs):
    delete_cloudinary_image_on_update(sender, instance, 'logo')


@receiver(pre_delete, sender=System)
def delete_system_logo(sender, instance, **kwargs):
    delete_cloudinary_image(instance.logo)


class OpeningHours(models.Model):
    """Opening hours for each day of the week"""

    DAYS_OF_WEEK = [
        (0, "Monday"),
        (1, "Tuesday"),
        (2, "Wednesday"),
        (3, "Thursday"),
        (4, "Friday"),
        (5, "Saturday"),
        (6, "Sunday"),
    ]

    system = models.ForeignKey(
        System, on_delete=models.CASCADE, related_name="opening_hours"
    )
    day = models.IntegerField(choices=DAYS_OF_WEEK)
    open_time = models.TimeField()
    close_time = models.TimeField()
    is_closed = models.BooleanField(default=False)
    is_24_hours = models.BooleanField(default=False)

    class Meta:
        unique_together = ["system", "day"]
        ordering = ["day"]

    def clean(self):
        if not self.is_closed and not self.is_24_hours:
            if self.open_time >= self.close_time:
                raise ValidationError("Close time must be after open time")

    def __str__(self):
        return f"{self.get_day_display()} - {self.system.name}"


class PublicSliderImage(models.Model):
    """Rotating banner/slider images"""

    MAX_SLIDER_IMAGES = 5

    id = models.AutoField(primary_key=True)
    system = models.ForeignKey(
        System, on_delete=models.CASCADE, related_name="slider_images"
    )
    image = models.ImageField(upload_to="public/slider/")
    caption = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(
        null=True, blank=True, default=timezone.now
    )  # Make nullable with default
    updated_at = models.DateTimeField(
        null=True, blank=True, default=timezone.now
    )  # Make nullable with default

    def save(self, *args, **kwargs):
        if not self.pk:  # New image
            existing_count = PublicSliderImage.objects.filter(
                system=self.system
            ).count()
            if existing_count >= self.MAX_SLIDER_IMAGES:
                raise ValidationError(
                    f"Maximum number of slider images ({self.MAX_SLIDER_IMAGES}) reached for this system."
                )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Slider Image {self.id} - {self.system.name}"

    def delete(self, *args, **kwargs):
        delete_cloudinary_image(self.image)
        super().delete(*args, **kwargs)


@receiver(post_save, sender=PublicSliderImage)
def update_slider_image(sender, instance, **kwargs):
    delete_cloudinary_image_on_update(sender, instance, 'image')


@receiver(pre_delete, sender=PublicSliderImage)
def delete_slider_image(sender, instance, **kwargs):
    delete_cloudinary_image(instance.image)


from django.contrib.auth.hashers import make_password, check_password


class Employee(models.Model):
    """Employee belongs to a specific system"""

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="employee_profile", null=True
    )
    system = models.ForeignKey(
        "System", on_delete=models.CASCADE, related_name="employees"
    )
    name = models.CharField(max_length=100)
    role = models.CharField(
        max_length=50,
        choices=[
            ("waiter", "Waiter"),
            ("chef", "Chef"),
            ("delivery", "Delivery"),
            ("manager", "Manager"),
            ("head_chef", "Head Chef"),
            ("cashier", "Cashier"),
            ("inventory_manager", "Inventory Manager"),
            ("cashier_supermarket", "Cashier (Supermarket)"),
            ("manager_supermarket", "Manager (Supermarket)"),
            ("inventory_manager_supermarket", "Inventory Manager (Supermarket)"),
        ],
    )
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.role}"

    class Meta:
        unique_together = ("user", "system")



def default_expiry():
    return timezone.now() + timedelta(minutes=15)


class PasswordResetOTP(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="password_reset_otps"
    )
    otp_code = models.CharField(max_length=6)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=default_expiry)  # Default expiration time

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"OTP for {self.user.username} - {self.otp_code}"

    def is_expired(self):
        return timezone.now() > self.expires_at

    def is_valid(self):
        return not self.is_used and not self.is_expired()


class UserTwoFactorInfo(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="twofa_info")
    enabled = models.BooleanField(default=False)
    # Add more fields here if needed (e.g., backup codes, last verified, etc.)

    def __str__(self):
        return f"2FA info for {self.user.username} (enabled: {self.enabled})"


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    last_selected_system_id = models.IntegerField(null=True, blank=True)  # Field to store the last selected system

    def __str__(self):
        return f"{self.user.username}'s Profile"


class TwoFactorEmailCode(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return f"2FA code for {self.user.email} (used: {self.is_used})"


# --- Reusable Cloudinary image deletion helpers ---
def delete_cloudinary_image(image_field):
    if image_field:
        try:
            public_id = image_field.name.rsplit('.', 1)[0]
            cloudinary.uploader.destroy(public_id)
        except Exception:
            pass
        try:
            default_storage.delete(image_field.name)
        except Exception:
            pass

def delete_cloudinary_image_on_update(sender, instance, field_name):
    if instance.pk:
        try:
            old_instance = sender.objects.get(pk=instance.pk)
            old_image = getattr(old_instance, field_name, None)
            new_image = getattr(instance, field_name, None)
            if old_image and old_image != new_image:
                delete_cloudinary_image(old_image)
        except sender.DoesNotExist:
            pass


class TwoFATempSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def is_valid(self):
        return self.is_active and (timezone.now() - self.created_at) < timedelta(seconds=60)
