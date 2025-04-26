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


class EmployeeLoginSerializer(serializers.Serializer):
    """Login serializer"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)