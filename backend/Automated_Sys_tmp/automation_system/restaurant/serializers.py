from core.models import System  , Employee
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import MenuItem
from .models import Order, OrderItem
from .models import InventoryItem
from django.shortcuts import get_object_or_404

from rest_framework.exceptions import NotFound, PermissionDenied

class MenuItemSerializer(serializers.ModelSerializer):
    VALID_CATEGORIES = ['food', 'soups', 'drink', 'dessert']

    class Meta:
        model = MenuItem
        fields = [
            "id", "system", "name", "description", "price", "is_available",
            "category", "image", "created_at", "updated_at", "cost"
        ]
        read_only_fields = ["id", "created_at", "updated_at", "system"]

    description = serializers.CharField(required=False, allow_blank=True)
    price = serializers.DecimalField(required=True, max_digits=10, decimal_places=2 )
    image = serializers.ImageField(required=False, allow_null=True)
    cost = serializers.DecimalField(required=True, max_digits=10, decimal_places=2)

    def create(self, validated_data):
        request = self.context["request"]
        system_id = self.context["view"].kwargs.get("system_id")

        try:
            system = System.objects.get(id=system_id, owner=request.user)
        except System.DoesNotExist:
            raise serializers.ValidationError("Invalid system or unauthorized access.")

        validated_data["system"] = system
        return super().create(validated_data)

    def validate(self, attrs):
        price = attrs.get("price")
        cost = attrs.get("cost")

        if price is None:
            raise serializers.ValidationError("Price is required.")
        if cost is None:
            raise serializers.ValidationError("Cost is required.")

        if price <= 0:
            raise serializers.ValidationError("The price must be a positive number.")

        if cost <= 0:
            raise serializers.ValidationError("The cost must be a positive number.")
        if cost >= price:
            raise serializers.ValidationError("The cost must be lower than the price.")

        return attrs

    def validate_category(self, value):
        """Validate that the category is not empty if provided"""
        if value and not value.strip():
            raise serializers.ValidationError("Category cannot be empty")
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
    waiter = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.filter(role="waiter"), allow_null=True, required=False)
    profit = serializers.SerializerMethodField()
    order_type = serializers.ChoiceField(
        choices=Order.ORDER_TYPE_CHOICES,
        default="in_house",
        help_text="Set to 'delivery' only for delivery orders. Default is 'in_house'."
    )

    class Meta:
        model = Order
        fields = [
            "id", "system", "customer_name", "table_number", "waiter", 
            "total_price", "profit", "status", "order_type", "order_items", 
            "created_at", "updated_at"
        ]
        read_only_fields = ["id", "total_price", "created_at", "updated_at", "system"]

    def create(self, validated_data):
        request = self.context["request"]
        system_id = self.context["view"].kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)
        validated_data["system"] = system
        return super().create(validated_data)
    
    def get_profit(self, obj):
        return obj.calculate_profit()

    def validate(self, data):
        request = self.context["request"]
        user = request.user
        system_id = self.context["view"].kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)

        # Validate order type specific requirements
        order_type = data.get('order_type', 'in_house')
        if order_type == 'delivery':
            if not data.get('customer_name'):
                raise serializers.ValidationError({
                    "customer_name": "Customer name is required for delivery orders"
                })
            # Clear table number for delivery orders
            data['table_number'] = None
        else:  # in_house
            if not data.get('table_number'):
                raise serializers.ValidationError({
                    "table_number": "Table number is required for in-house orders"
                })
            # Clear customer name for in-house orders if not provided
            if not data.get('customer_name'):
                data['customer_name'] = None

        try:
            employee = Employee.objects.get(system=system, user=user)
            if employee.role == 'waiter':
                data['waiter'] = employee
        except Employee.DoesNotExist:
            pass
        return data

class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = ['id', 'name', 'quantity', 'unit', 'min_threshold']
        extra_kwargs = {
            'unit': {'required': False, 'allow_null': True},
            'min_threshold': {'required': False, 'allow_null': True},
        }