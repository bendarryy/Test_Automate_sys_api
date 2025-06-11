from django.db import models
from django.contrib.auth.models import User
import uuid
from django.utils import timezone
from django.core.exceptions import ValidationError


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
        ('restaurant', 'Restaurant'),
        ('supermarket', 'Supermarket'),
    ]

    # 🔑 Core Identifiers
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(unique=True, editable=False, default=uuid.uuid4)
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_systems')
    category = models.CharField(max_length=50, choices=SYSTEM_CATEGORIES)
    description = models.TextField(blank=True)
    
    # 🌐 Domain & Access Control
    subdomain = models.CharField(max_length=100, unique=True, null=True, blank=True)
    custom_domain = models.CharField(max_length=255, unique=True, null=True, blank=True)
    ssl_enabled = models.BooleanField(default=False)
    is_public = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    
    # 📍 Location Information
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    custom_link = models.URLField(max_length=500, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    
    # 🎨 Public Profile Information
    logo = models.ImageField(upload_to='public/logos/', null=True, blank=True)
    public_title = models.CharField(max_length=200, blank=True, null=True)
    public_description = models.TextField(blank=True, null=True)
    primary_color = models.CharField(max_length=7, default="#000000", null=True)
    secondary_color = models.CharField(max_length=7, default="#FFFFFF", null=True)
    email = models.EmailField(blank=True, null=True)
    whatsapp_number = models.CharField(max_length=20, blank=True, null=True)
    
    # 🔗 Social Media Links (stored as JSON)
    social_links = models.JSONField(default=dict, blank=True, help_text="""Format: {
        "facebook": "url",
        "instagram": "url",
        "twitter": "url",
        "linkedin": "url",
        "youtube": "url",
        "tiktok": "url"
    }""")
    

    # 🕒 Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['owner']),
            models.Index(fields=['category']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_public']),
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


class OpeningHours(models.Model):
    """Opening hours for each day of the week"""
    DAYS_OF_WEEK = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]

    system = models.ForeignKey(System, on_delete=models.CASCADE, related_name='opening_hours')
    day = models.IntegerField(choices=DAYS_OF_WEEK)
    open_time = models.TimeField()
    close_time = models.TimeField()
    is_closed = models.BooleanField(default=False)
    is_24_hours = models.BooleanField(default=False)

    class Meta:
        unique_together = ['system', 'day']
        ordering = ['day']

    def clean(self):
        if not self.is_closed and not self.is_24_hours:
            if self.open_time >= self.close_time:
                raise ValidationError("Close time must be after open time")

    def __str__(self):
        return f"{self.get_day_display()} - {self.system.name}"


class PublicSliderImage(models.Model):
    """Rotating banner/slider images"""
    MAX_SLIDER_IMAGES = 5

    system = models.ForeignKey(System, on_delete=models.CASCADE, related_name='slider_images')
    image = models.ImageField(upload_to='public/slider/')
    caption = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.pk:  # New image
            existing_count = PublicSliderImage.objects.filter(system=self.system).count()
            if existing_count >= self.MAX_SLIDER_IMAGES:
                raise ValidationError(
                    f'Maximum number of slider images ({self.MAX_SLIDER_IMAGES}) reached for this system.'
                )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Slider Image - {self.system.name}"


from django.contrib.auth.hashers import make_password, check_password




class Employee(models.Model):
    """Employee belongs to a specific system"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile', null=True)
    system = models.ForeignKey('System', on_delete=models.CASCADE, related_name="employees")
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=50, choices=[
        ('waiter', 'Waiter'),
        ('chef', 'Chef'),
        ('delivery', 'Delivery'),
        ('manager', "Manager"),
        ("head_chef" , "Head Chef"),
        ("cashier", "Cashier"),
        ("inventory_manager", "Inventory Manager")
    ])
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.role}"

    class Meta:
        unique_together = ('user', 'system')



# Don't Touch  Under Devolpment 
class UserRole(models.Model):
    # Role types allowed for each system type
    ROLE_CHOICES = [
        # (value, label, [allowed_system_types])
        ('owner', 'Owner', ['restaurant', 'cafe', 'workshop']),
        ('manager', 'Manager', ['restaurant', 'cafe', 'workshop']),
        ('waiter', 'Waiter', ['restaurant']),  # Only for restaurants
        ('barista', 'Barista', ['cafe']),      # Only for cafes
        ('technician', 'Technician', ['workshop']),  # Only for workshops
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    system = models.ForeignKey(System, on_delete=models.CASCADE)
    role = models.CharField(max_length=20)
    
    class Meta:
        unique_together = ('user', 'system')  # One role per user per system

    def save(self, *args, **kwargs):
        # Validate role matches system type
        allowed_roles = [r for r in self.ROLE_CHOICES if self.system.system_type in r[2]]
        if self.role not in [r[0] for r in allowed_roles]:
            raise ValueError(f"Role '{self.role}' not allowed for {self.system.system_type} systems")
        super().save(*args, **kwargs)
        
  
# usage    fo UserRole 
        
# # This will work:
# restaurant = System.objects.get(system_type='restaurant')
# UserRole.objects.create(user=some_user, system=restaurant, role='waiter')

# # This will FAIL (raises ValueError):
# cafe = System.objects.get(system_type='cafe')
# UserRole.objects.create(user=some_user, system=cafe, role='waiter')  # Waiters can't be in cafes!