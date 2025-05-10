from core.models import System, UserRole, Employee
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Product, StockChange, Sale, SaleItem, Discount
from django.utils import timezone
from decimal import Decimal
import time


class InventorysupItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "price", "stock_quantity", "expiry_date"]


class StockChangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockChange
        fields = "__all__"


class StockUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["stock_quantity"]


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = SaleItem
        fields = [
            "id",
            "product",
            "product_name",
            "quantity",
            "unit_price",
            "discount_amount",
            "total_price",
        ]


class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)
    cashier_name = serializers.CharField(
        source="cashier.user.get_full_name", read_only=True
    )

    class Meta:
        model = Sale
        fields = [
            "id",
            "receipt_number",
            "cashier",
            "cashier_name",
            "total_price",
            "discount_amount",
            "payment_type",
            "created_at",
            "vat_amount",
            "vat_rate",
            "items",
        ]


class SaleCreateSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)

    class Meta:
        model = Sale
        fields = ["payment_type", "items"]

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        system_id = self.context["system_id"]
        cashier = self.context["cashier"]

        # Generate receipt number
        receipt_number = f"RCP-{system_id}-{int(time.time())}"

        sale = Sale.objects.create(
            system_id=system_id,
            cashier=cashier,
            receipt_number=receipt_number,
            **validated_data,
        )

        # Create sale items and update stock
        for item_data in items_data:
            product = item_data["product"]
            quantity = Decimal(str(item_data["quantity"]))

            # Check stock availability
            if product.stock_quantity < quantity:
                raise serializers.ValidationError(
                    f"Insufficient stock for {product.name}"
                )

            # Set unit price from product's price and calculate total
            item_data["unit_price"] = product.price
            item_data["total_price"] = (product.price * quantity) - item_data.get(
                "discount_amount", Decimal("0")
            )

            # Create sale item
            SaleItem.objects.create(sale=sale, **item_data)

            # Update stock
            product.stock_quantity -= quantity
            product.save()

            # Create stock change record
            StockChange.objects.create(
                product=product, quantity_changed=-quantity, change_type="remove"
            )

        # Calculate total
        sale.calculate_total()
        return sale


class DiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = [
            "id",
            "name",
            "discount_type",
            "product",
            "percentage",
            "start_date",
            "end_date",
            "is_active",
        ]


class ApplyDiscountSerializer(serializers.Serializer):
    discount_id = serializers.IntegerField()

    def validate_discount_id(self, value):
        try:
            discount = Discount.objects.get(id=value)
            if not discount.is_active:
                raise serializers.ValidationError("Discount is not active")
            if discount.start_date > timezone.now():
                raise serializers.ValidationError("Discount has not started yet")
            if discount.end_date < timezone.now():
                raise serializers.ValidationError("Discount has expired")
            return value
        except Discount.DoesNotExist:
            raise serializers.ValidationError("Discount does not exist")
