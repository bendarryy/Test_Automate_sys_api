from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import System ,Employee ,  PublicSliderImage , OpeningHours
from django.contrib.auth.models import  User ,Group, Permission 
from django.contrib.auth.hashers import make_password, check_password
from django.core.exceptions import ValidationError
import uuid
from django.utils import timezone



class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    date_joined = serializers.DateTimeField(read_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'first_name', 'last_name',
            'date_joined'
        ]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        user.is_staff = True
        user.save()

        group, _ = Group.objects.get_or_create(name="Owner")
        user.groups.add(group)

        return user

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already taken")
        return value

class ProfileSerializer(serializers.Serializer):
    user = UserSerializer(source='*', read_only=True)
    role = serializers.SerializerMethodField()
    systems = serializers.SerializerMethodField()

    def get_role(self, obj):
        if obj.groups.filter(name="Owner").exists():
            return "owner"
        try:
            employee = obj.employee_profile
            return employee.role
        except Employee.DoesNotExist:
            return None

    def get_systems(self, obj):
        if obj.groups.filter(name="Owner").exists():
            systems = System.objects.filter(owner=obj)
            return BaseSystemSerializer(systems, many=True).data
        try:
            employee = obj.employee_profile
            system = employee.system
            return {
                'id': system.id,
                'category': system.category,
                'name': system.name,
                'is_active': system.is_active,
                'subdomain': system.subdomain,
                'custom_domain': system.custom_domain
            }
        except Employee.DoesNotExist:
            return None
        
class SystemListSerializer(serializers.ModelSerializer):
    class Meta:
        model = System
        fields = ['id', 'name', 'category' ]
        read_only_fields = fields  # All fields are read-only



class BaseSystemSerializer(serializers.ModelSerializer):
    """Base serializer for system operations with common validation logic"""
    name = serializers.CharField(
        validators=[UniqueValidator(queryset=System.objects.all())],
        help_text="System name"
    )
    category = serializers.ChoiceField(
        choices=System.SYSTEM_CATEGORIES,
        help_text="Type of system (restaurant or supermarket)"
    )
    description = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="System description"
    )
    is_public = serializers.BooleanField(
        default=True,
        help_text="Whether the system is publicly accessible"
    )
    subdomain = serializers.CharField(
        required=False,
    
        allow_null=True,
        help_text="Subdomain for your system"
    )
    custom_domain = serializers.CharField(
        required=False,
        allow_null=True,
        help_text="Custom domain for the system"
    )
    phone_number = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Phone number for the system"
    )
    latitude = serializers.DecimalField(
        required=False,
        allow_null=True,
        max_digits=9,
        decimal_places=6,
        help_text="Latitude coordinate of the system location"
    )
    longitude = serializers.DecimalField(
        required=False,
        allow_null=True,
        max_digits=9,
        decimal_places=6,
        help_text="Longitude coordinate of the system location"
    )
    custom_link = serializers.URLField(
        required=False,
        allow_blank=True,
        allow_null=True,
        help_text="Optional custom URL for the system location (e.g., a map link or website)"
    )
    location_link = serializers.SerializerMethodField(
        
        
        help_text="Returns the custom link if provided, otherwise a Google Maps link based on latitude and longitude"
    )

    class Meta:
        model = System
        fields = [
            "id",
            "name",
            "category",
            "description",
            "is_public",
            "subdomain",
            "custom_domain",
            "phone_number",
            "latitude",
            "longitude",
            "custom_link",
            "location_link",
        ]

    def get_location_link(self, obj):
        """Return the custom link if available, otherwise generate a Google Maps link."""
        if obj.custom_link:
            return obj.custom_link
        if obj.latitude is not None and obj.longitude is not None:
            return f"https://www.google.com/maps?q={obj.latitude},{obj.longitude}"
        return None

    def validate_subdomain(self, value):
        if not value:
            return value
            
        # Check if subdomain is already taken
        queryset = System.objects.all()
        if self.instance:  # For updates
            queryset = queryset.exclude(id=self.instance.id)
            
        if queryset.filter(subdomain=value).exists():
            raise serializers.ValidationError("This subdomain is already taken")
        
        # Validate subdomain format
        if not value.isalnum() and not all(c.isalnum() or c == '-' for c in value):
            raise serializers.ValidationError("Subdomain can only contain letters, numbers, and hyphens")
        
        if len(value) < 3:
            raise serializers.ValidationError("Subdomain must be at least 3 characters long")
            
        if len(value) > 63:
            raise serializers.ValidationError("Subdomain cannot be longer than 63 characters")
            
        return value.lower()

    def validate_custom_domain(self, value):
        if not value:
            return value
            
        # Check if custom domain is already taken
        queryset = System.objects.all()
        if self.instance:  # For updates
            queryset = queryset.exclude(id=self.instance.id)
            
        if queryset.filter(custom_domain=value).exists():
            raise serializers.ValidationError("This domain is already taken")
            
        # Basic domain validation
        if not all(c.isalnum() or c in '.-' for c in value):
            raise serializers.ValidationError("Domain can only contain letters, numbers, dots, and hyphens")
            
        if len(value) > 255:
            raise serializers.ValidationError("Domain cannot be longer than 255 characters")
            
        # Validate domain format
        parts = value.split('.')
        if len(parts) < 2:
            raise serializers.ValidationError("Domain must have at least one dot (e.g., example.com)")
            
        # Validate each part of the domain
        for part in parts:
            if not part:
                raise serializers.ValidationError("Domain parts cannot be empty")
            if len(part) > 63:
                raise serializers.ValidationError("Each part of the domain cannot be longer than 63 characters")
            if part[0] == '-' or part[-1] == '-':
                raise serializers.ValidationError("Domain parts cannot start or end with a hyphen")
            if not all(c.isalnum() or c == '-' for c in part):
                raise serializers.ValidationError("Domain parts can only contain letters, numbers, and hyphens")
            
        # Validate TLD (Top Level Domain)
        tld = parts[-1]
        if len(tld) < 2:
            raise serializers.ValidationError("Top level domain must be at least 2 characters")
            
        return value.lower()

    def validate(self, data):
        """Custom validation for latitude and longitude."""
        latitude = data.get("latitude")
        longitude = data.get("longitude")

        if latitude is not None and (latitude < -90 or latitude > 90):
            raise serializers.ValidationError({"latitude": "Latitude must be between -90 and 90 degrees."})
        if longitude is not None and (longitude < -180 or longitude > 180):
            raise serializers.ValidationError({"longitude": "Longitude must be between -180 and 180 degrees."})

        return data

class SystemCreateSerializer(BaseSystemSerializer):
    """Serializer for system creation"""
    class Meta(BaseSystemSerializer.Meta):
        fields = BaseSystemSerializer.Meta.fields + ['id']
        read_only_fields = ['id']

class SystemUpdateSerializer(BaseSystemSerializer):
    """Serializer for system updates"""
    name = serializers.CharField(required=False)
    category = serializers.ChoiceField(required=False, read_only=True, choices=System.SYSTEM_CATEGORIES)
    is_active = serializers.BooleanField(required=False)
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        help_text="Your current password for verification",
        style={'input_type': 'password'},
        error_messages={
            'required': 'Password is required for system updates',
            'blank': 'Password cannot be blank'
        }
    )

    class Meta(BaseSystemSerializer.Meta):
        fields = BaseSystemSerializer.Meta.fields + ['is_active', 'password']
        read_only_fields = ['category']  # Explicitly mark category as read-only

    def validate(self, data):
        # Ensure category is not being updated
        if 'category' in data:
            raise serializers.ValidationError({"category": "Category cannot be updated"})
        
        # Ensure password is provided and correct
        if 'password' not in data:
            raise serializers.ValidationError({"password": "Password is required for system updates"})
            
        user = self.context['request'].user
        if not user.check_password(data['password']):
            raise serializers.ValidationError({"password": "Incorrect password"})
            
        return data

    def validate_password(self, value):
        if not value:
            raise serializers.ValidationError("Password cannot be blank")
        return value

from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError
from .models import Employee, System

class EmployeeLoginSerializer(serializers.Serializer):
    """Login serializer"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        """
        Validate the login credentials without revealing whether the email exists
        """
        email = data.get('email')
        password = data.get('password')

        # Basic format validation only
        if not email or not password:
            raise serializers.ValidationError("Invalid email or password.")
        
        return data

class EmployeeSerializer(serializers.ModelSerializer):
    """Used for listing and showing employees"""
    email = serializers.EmailField(source='user.email')

    class Meta:
        model = Employee
        fields = ['id', 'name', 'role', 'phone', 'email']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')

        # Hide phone and email for non-owners
        if request and request.user != instance.system.owner:
            data.pop('phone', None)
            data.pop('email', None)

        return data

class EmployeeInviteSerializer(serializers.Serializer):
    """Used when inviting an employee"""
    email = serializers.EmailField(validators=[UniqueValidator(queryset=User.objects.all())])
    name = serializers.CharField(max_length=100)
    role = serializers.ChoiceField(choices=Employee._meta.get_field('role').choices)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    system = serializers.PrimaryKeyRelatedField(queryset=System.objects.all())

    def create(self, validated_data):
        # Create a new User
        user = User.objects.create(
            username=validated_data['email'],  # Using email as username
            email=validated_data['email'],
            password=make_password(None)  # Random password; user must reset
        )

        # Create Employee linked to User and System
        employee = Employee.objects.create(
            user=user,
            system=validated_data['system'],
            name=validated_data['name'],
            role=validated_data['role'],
            phone=validated_data.get('phone')
        )
        return employee

class EmployeeUpdateSerializer(serializers.ModelSerializer):
    """Used for updating employee details by system owner"""
    email = serializers.EmailField(source='user.email', required=False)
    name = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=Employee._meta.get_field('role').choices, required=False)
    phone = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Employee
        fields = ['name', 'role', 'phone', 'email', 'password']

    def validate_email(self, value):
        """Ensure email is unique for the system, excluding current employee"""
        employee = self.instance
        system = employee.system
        if Employee.objects.filter(system=system, user__email=value).exclude(id=employee.id).exists():
            raise serializers.ValidationError("This email is already in use for this system.")
        return value

    def update(self, instance, validated_data):
        # Update Employee fields
        instance.name = validated_data.get('name', instance.name)
        instance.role = validated_data.get('role', instance.role)
        instance.phone = validated_data.get('phone', instance.phone)

        # Update User email if provided
        if 'user' in validated_data and 'email' in validated_data['user']:
            instance.user.email = validated_data['user']['email']
            instance.user.username = validated_data['user']['email']  # Sync username with email
            instance.user.save()

        # Update password if provided
        if 'password' in validated_data:
            instance.user.set_password(validated_data['password'])
            instance.user.save()

        instance.save()
        return instance

class EmployeeListSerializer(serializers.ModelSerializer):
    """Used for listing and showing employees in EmployeeListView and EmployeeDetailView"""
    email = serializers.EmailField(source='user.email')
    system = serializers.PrimaryKeyRelatedField(queryset=System.objects.all())

    class Meta:
        model = Employee
        fields = ['id', 'system', 'name', 'role', 'phone', 'email', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_active']

class EmployeeCreateSerializer(serializers.Serializer):
    """Used when creating/inviting an employee"""
    email = serializers.EmailField()
    name = serializers.CharField(max_length=100)
    role = serializers.ChoiceField(choices=Employee._meta.get_field('role').choices)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    system = serializers.PrimaryKeyRelatedField(queryset=System.objects.all())
    password = serializers.CharField(write_only=True, required=True)

    def validate_email(self, value):
        """Ensure email is unique for the system"""
        system = self.initial_data.get('system')
        if Employee.objects.filter(system_id=system, user__email=value).exists():
            raise serializers.ValidationError("This email is already in use for this system.")
        return value

    def create(self, validated_data):
        # Create a new User
        user = User.objects.create(
            username=validated_data['email'],  # Using email as username
            email=validated_data['email'],
            password=make_password(validated_data['password'])  # Set provided password
        ) 

        # Create Employee linked to User and System
        employee = Employee.objects.create(
            user=user,
            system=validated_data['system'],
            name=validated_data['name'],
            role=validated_data['role'],
            phone=validated_data.get('phone'),
            is_active=True
        )
        group, created = Group.objects.get_or_create(name="Employee")  # Create if not exists
        user.groups.add(group)  # Assign group
        return employee

class SystemDeleteSerializer(serializers.Serializer):
    """Serializer for system deletion with password confirmation"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        help_text="Your current password for verification",
        style={'input_type': 'password'},
        error_messages={
            'required': 'Password is required for system deletion',
            'blank': 'Password cannot be blank'
        }
    )

    def validate_password(self, value):
        if not value:
            raise serializers.ValidationError("Password cannot be blank")
        
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Incorrect password")
        return value
# update profile by ali
class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile with password verification"""
    current_password = serializers.CharField(write_only=True, required=True)
    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['current_password', 'username', 'email', 'first_name', 'last_name', 'phone']

    def validate_current_password(self, value):
        if not check_password(value, self.context['request'].user.password):
            raise serializers.ValidationError("Current password is incorrect")
        return value

    def validate_username(self, value):
        if value and User.objects.exclude(pk=self.context['request'].user.pk).filter(username=value).exists():
            raise serializers.ValidationError("Username already taken")
        return value

    def validate_email(self, value):
        if value and User.objects.exclude(pk=self.context['request'].user.pk).filter(email=value).exists():
            raise serializers.ValidationError("Email already taken")
        return value

    def update(self, instance, validated_data):
        # Remove current_password from validated_data as it's not a model field
        validated_data.pop('current_password', None)
        
        # Update User model fields
        for attr, value in validated_data.items():
            if attr != 'phone':  # Skip phone as it's not a User model field
                setattr(instance, attr, value)
        
        # Update phone number in Employee model if it exists
        phone = validated_data.get('phone')
        if phone is not None:
            try:
                employee = instance.employee_profile
                employee.phone = phone
                employee.save()
            except Employee.DoesNotExist:
                pass  # User is not an employee, so no phone to update
        
        instance.save()
        return instance

class PublicSystemSerializer(serializers.ModelSerializer):
    class Meta:
        model = System
        fields = ['name', 'description', 'category' , "phone_number" ,  "latitude", "longitude" , 'custom_domain']
        read_only_fields = ['name', 'description', 'category' , "phone_number" ,  "latitude", "longitude" , 'custom_domain']

class OpeningHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpeningHours
        fields = ['day', 'open_time', 'close_time', 'is_closed', 'is_24_hours']



class SystemSerializer(serializers.ModelSerializer):
    opening_hours = OpeningHoursSerializer(many=True, read_only=True)
    
    class Meta:
        model = System
        fields = [
            'id', 'name', 'category', 'subdomain' , 'custom_domain',  'description', 'is_public',
            'logo', 'public_title', 'public_description', 'phone_number',
            'primary_color', 'secondary_color', 'is_active',
            'email', 'whatsapp_number',
            'social_links', 'opening_hours' , 'design_settings'
        ]
        extra_kwargs = {
            'logo': {'required': False, 'allow_null': True},
            'public_title': {'required': False, 'allow_blank': True},
            'public_description': {'required': False, 'allow_blank': True},
            'primary_color': {'required': False, 'allow_blank': True},
            'secondary_color': {'required': False, 'allow_blank': True},
            'email': {'required': False, 'allow_blank': True, 'allow_null': True},
            'whatsapp_number': {'required': False, 'allow_blank': True, 'allow_null': True},
            'social_links': {'required': False},
            'design_settings': {'required': False}
        }

class PublicSliderImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicSliderImage
        fields = ['id', 'image', 'caption', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']  # Make these fields read-only
        extra_kwargs = {
            'caption': {'required': False},
            'is_active': {'required': False},
            'created_at': {'required': False},
            'updated_at': {'required': False}
        }

    def validate(self, data):
        system = self.context.get('system')
        if not self.instance and system:  # Only check for new images
            if PublicSliderImage.objects.filter(system=system).count() >= PublicSliderImage.MAX_SLIDER_IMAGES:
                raise serializers.ValidationError(
                    f'Maximum number of slider images ({PublicSliderImage.MAX_SLIDER_IMAGES}) reached for this system.'
                )
        return data

    def create(self, validated_data):
        system = self.context.get('system')
        if not system:
            raise serializers.ValidationError("System context is required")
        validated_data['system'] = system
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Update the updated_at field when the instance is updated
        instance.updated_at = timezone.now()
        return super().update(instance, validated_data)

class SystemPublicProfileSerializer(serializers.ModelSerializer):
    # Add read-only fields
    name = serializers.CharField(read_only=True)
    category = serializers.CharField(read_only=True)
    subdomain = serializers.CharField(read_only=True)
    custom_link = serializers.CharField(read_only=True)

    class Meta:
        model = System
        fields = [
            # Read-only fields
            'name',
            'category',
            'subdomain',
            'custom_link',
            # Editable fields
            'is_public',
            'public_title',
            'public_description',
            'primary_color',
            'secondary_color',
            'email',
            'whatsapp_number',
            'social_links',
            'logo',
            'design_settings'
        ]
        extra_kwargs = {
            'is_public': {'required': False},
            'public_title': {'required': False},
            'public_description': {'required': False},
            'primary_color': {'required': False},
            'secondary_color': {'required': False},
            'email': {'required': False},
            'whatsapp_number': {'required': False},
            'social_links': {'required': False},
            "subdomain": {'required': False, 'allow_null': True},
            "custom_link": {'required': False, 'allow_null': True},
            'design_settings': {'required': False}
        }


class SystemLogoUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating only the system logo"""
    class Meta:
        model = System
        fields = ['logo']
        extra_kwargs = {
            'logo': {'required': False, 'allow_null': True}
        }