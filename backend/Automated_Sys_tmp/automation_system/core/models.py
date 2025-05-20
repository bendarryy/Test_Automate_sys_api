from django.db import models
from django.contrib.auth.models import User
import uuid
from django.utils import timezone


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
    """Each generated system (e.g., a restaurant) is stored here"""
    SYSTEM_CATEGORIES = [
        ('restaurant', 'Restaurant'),
        ('supermarket', 'Supermarket'),
    ]

    # 🔑 Core Identifiers
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(unique=True, editable=False)

    name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    category = models.CharField(max_length=50, choices=SYSTEM_CATEGORIES)
    
    # 🌐 Domain Handling
    subdomain = models.CharField(max_length=100, unique=True, null=True, blank=True)  # Optional subdomain
    custom_domain = models.CharField(max_length=255, unique=True, null=True, blank=True)
    ssl_enabled = models.BooleanField(default=False)
    
    # 📋 Metadata
    description = models.TextField(blank=True)
    is_public = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    # 🕒 Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

# 📍 Location Information (Accurate with Latitude & Longitude)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    # google_maps_link = models.URLField(max_length=500, blank=True, null=True)
   
    
    def __str__(self):
        return f"{self.name} ({self.category})"

    def save(self, *args, **kwargs):
        # Ensure UUID is generated for new records
        if not self.uuid:
            while True:
                new_uuid = uuid.uuid4()
                if not System.objects.filter(uuid=new_uuid).exists():
                    self.uuid = new_uuid
                    break

        # Update the updated_at timestamp
        self.updated_at = timezone.now()
        
        # Auto-generate Google Maps Link if coordinates are provided
        if self.latitude and self.longitude:
            self.google_maps_link = f"https://www.google.com/maps?q={self.latitude},{self.longitude}"
        else:
            self.google_maps_link = None
        
        super().save(*args, **kwargs)

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