from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import System ,Employee
from django.contrib.auth.models import  User ,Group, Permission 
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError
import uuid



class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)  # Hashes password
        user.is_staff = True  # Make user a staff member to access admin
        user.save()  # Save changes

        # Try adding the user to the "Owner" group
        group, created = Group.objects.get_or_create(name="Owner")  # Create if not exists
        user.groups.add(group)  # Assign group

        return user

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken")
        return value


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
        fields = ['name', 'category']
        
        
        

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