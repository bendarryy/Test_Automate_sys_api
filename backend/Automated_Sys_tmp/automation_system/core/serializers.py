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