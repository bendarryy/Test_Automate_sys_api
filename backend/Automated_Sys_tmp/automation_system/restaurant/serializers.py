from core.models import System ,UserRole , Employee
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import MenuItem
from .models import Order, OrderItem
from .models import InventoryItem
from django.shortcuts import get_object_or_404

from rest_framework.exceptions import NotFound, PermissionDenied

class MenuItemSerializer(serializers.ModelSerializer):
    VALID_CATEGORIES = ['food', 'soups', 'drink', 'dessert']  # Define valid categories
    class Meta:
        model = MenuItem
        fields = [
            "id", "system", "name", "description", "price", "is_available",
            "category", "image", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at", "system"]

    description = serializers.CharField(required=False, allow_blank=True)
    price = serializers.DecimalField(required=False, max_digits=10, decimal_places=2, allow_null=True)
    image = serializers.ImageField(required=False, allow_null=True)

    def create(self, validated_data):
        request = self.context["request"]
        system_id = self.context["view"].kwargs.get("system_id")

        # Ensure system exists and belongs to the current user
        try:
            system = System.objects.get(id=system_id, owner=request.user)
        except System.DoesNotExist:
            raise serializers.ValidationError("Invalid system or unauthorized access.")

        validated_data["system"] = system
        return super().create(validated_data)

    def validate_price(self, value):
        """
        Check that the price is a positive value.
        """
        if value <= 0:
            raise serializers.ValidationError("The price must be a positive number.")
        return value


class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.ReadOnlyField(source="menu_item.name")
    menu_item = serializers.PrimaryKeyRelatedField(
        queryset=MenuItem.objects.all()
    )

    class Meta:
        model = OrderItem
        fields = ["id", "menu_item", "menu_item_name", "quantity"]
        read_only_fields = ["id", "menu_item_name"]

    def validate(self, data):
        return data

class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True, read_only=True)
    waiter = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.filter(role="waiter"), allow_null=True)

    class Meta:
        model = Order
        fields = ["id", "system", "customer_name", "table_number", "waiter", "total_price", "status", "order_items", "created_at", "updated_at"]
        read_only_fields = ["id", "total_price", "created_at", "updated_at", "system"]

    def create(self, validated_data):
        request = self.context["request"]
        system_id = self.context["view"].kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)

        validated_data["system"] = system
        return super().create(validated_data)

    def validate_waiter(self, value):
        """Ensure the selected user is a waiter and restrict waiters to assigning themselves."""
        request = self.context["request"]
        system_id = self.context["view"].kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)

        if value:
            if value.role != "waiter":
                raise serializers.ValidationError("Selected user is not a waiter.")
            # If the user is a waiter, they can only assign themselves
            if system.owner != request.user:
                try:
                    employee = Employee.objects.get(system=system, user=request.user)
                    if employee.role == 'waiter' and value != employee:
                        raise serializers.ValidationError("Waiters can only assign themselves to orders.")
                except Employee.DoesNotExist:
                    raise PermissionDenied("You do not have permission to assign waiters.")
        return value


class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = ['id', 'name', 'quantity', 'unit', 'min_threshold']
        extra_kwargs = {
            'unit': {'required': False, 'allow_null': True},
            'min_threshold': {'required': False, 'allow_null': True},
        }