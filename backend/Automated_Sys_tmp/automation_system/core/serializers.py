from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import System
from django.contrib.auth.models import  User ,Group, Permission 





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
        
        
        

from .models import Employee

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'system', 'name', 'role', 'phone', 'email', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_active']


class EmployeeCreateSerializer(serializers.ModelSerializer):
    """Used when creating/inviting an employee"""

    email = serializers.CharField(
        validators=[UniqueValidator(queryset=Employee.objects.all())]
    )
    password = serializers.CharField(write_only=True)  # Do not return password in response

    class Meta:
        model = Employee
        fields = ['system', 'name', 'role', 'phone', 'email', 'password']

    def create(self, validated_data):
        employee = Employee(
            system=validated_data['system'],
            name=validated_data['name'],
            role=validated_data['role'],
            phone=validated_data.get('phone'),
            email=validated_data.get('email'),
        )
        employee.set_password(validated_data['password'])  # hash password
        employee.save()
        return employee

class EmployeeSerializer(serializers.ModelSerializer):
    """Used for listing and showing employees"""
    class Meta:
        model = Employee
        fields = ['id', 'name', 'role', 'phone', 'email']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # For example, only the system owner should see phone and email
        if not self.context.get('request').user == instance.system.owner:
            data.pop('phone', None)  # Remove phone number
            data.pop('email', None)  # Remove email address
        return data


from django.core.exceptions import ValidationError

class EmployeeLoginSerializer(serializers.Serializer):
    """Login serializer"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        """Ensure the email exists in the database"""
        try:
            Employee.objects.get(email=value)
        except Employee.DoesNotExist:
            raise ValidationError("No user with this email found.")
        return value
