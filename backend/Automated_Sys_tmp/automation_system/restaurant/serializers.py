from core.models import System ,UserRole
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import MenuItem
from .models import Order, OrderItem






class MenuItemSerializer(serializers.ModelSerializer):
    VALID_CATEGORIES = ['food' , 'soups' , 'drink', 'dessert']  # Define valid categories
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
        queryset=MenuItem.objects.all()  # This ensures the menu_item exists
    )

    class Meta:
        model = OrderItem
        fields = ["id", "menu_item", "menu_item_name", "quantity"]
        read_only_fields = ["id", "menu_item_name"]

    def validate(self, data):
        """
        Add any additional validation that requires access to multiple fields
        """
        # The system-specific validation will happen in the view
        return data

class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True, read_only=True)
    waiter = serializers.PrimaryKeyRelatedField(queryset=UserRole.objects.filter(role="waiter"), allow_null=True)

    class Meta:
        model = Order
        fields = ["id", "system", "customer_name", "table_number", "waiter", "total_price", "status", "order_items", "created_at", "updated_at"]
        read_only_fields = ["id", "total_price", "created_at", "updated_at", "system"]

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
    
    def validate_waiter(self, value):
        """Ensure the selected user is a waiter."""
        if value and value.role != "waiter":
            raise serializers.ValidationError("Selected user is not a waiter.")
        return value
