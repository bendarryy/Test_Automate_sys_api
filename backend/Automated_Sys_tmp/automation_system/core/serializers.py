from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import System ,Employee
from django.contrib.auth.models import  User ,Group, Permission 
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError
import uuid



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
            return SystemSerializer(systems, many=True).data
        try:
            employee = obj.employee_profile
            system = employee.system
            return {
                'id': system.id,
                'category': system.category
            }
        except Employee.DoesNotExist:
            return None
        
class SystemListSerializer(serializers.ModelSerializer):
    class Meta:
        model = System
        fields = ['id', 'name', 'category']
        read_only_fields = fields  # All fields are read-only



class SystemSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        validators=[UniqueValidator(queryset=System.objects.all())]
    )
    class Meta:
        model = System
        fields = ['name', 'category' , "id"]
        read_only_fields = ['id']
        
        
        

class SystemCreateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        validators=[UniqueValidator(queryset=System.objects.all())],
        help_text="Unique name for the system"
    )
    category = serializers.ChoiceField(
        choices=System.SYSTEM_CATEGORIES,
        help_text="Type of system (restaurant or supermarket)"
    )
    description = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Optional description of the system"
    )
    is_public = serializers.BooleanField(
        default=True,
        help_text="Whether the system is publicly accessible"
    )
    subdomain = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        help_text="Optional subdomain for your system (e.g., 'myrestaurant' for myrestaurant.yourdomain.com)"
    )
    custom_domain = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        help_text="Optional custom domain for the system"
    )

    class Meta:
        model = System
        fields = [
            'name', 
            'category', 
            'description', 
            'is_public', 
            'subdomain',
            'custom_domain'
        ]

    def validate_subdomain(self, value):
        # Check if subdomain is already taken
        if System.objects.filter(subdomain=value).exists():
            raise serializers.ValidationError("This subdomain is already taken")
        
        # Validate subdomain format
        if not value.isalnum() and not all(c.isalnum() or c == '-' for c in value):
            raise serializers.ValidationError("Subdomain can only contain letters, numbers, and hyphens")
        
        if len(value) < 3:
            raise serializers.ValidationError("Subdomain must be at least 3 characters long")
            
        if len(value) > 63:
            raise serializers.ValidationError("Subdomain cannot be longer than 63 characters")
            
        return value.lower()  # Convert to lowercase

    def validate_custom_domain(self, value):
        if not value:
            return value
            
        # Check if custom domain is already taken
        if System.objects.filter(custom_domain=value).exists():
            raise serializers.ValidationError("This domain is already taken")
            
        # Basic domain validation
        if not all(c.isalnum() or c in '.-' for c in value):
            raise serializers.ValidationError("Domain can only contain letters, numbers, dots, and hyphens")
            
        if len(value) > 255:
            raise serializers.ValidationError("Domain cannot be longer than 255 characters")
            
        return value.lower()  # Convert to lowercase

from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError
from .models import Employee, System

class EmployeeLoginSerializer(serializers.Serializer):
    """Login serializer"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        """Ensure the email exists in the User model and is linked to an active Employee"""
        if not User.objects.filter(email=value, employee_profile__is_active=True).exists():
            raise ValidationError("No active employee with this email found.")
        return value

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