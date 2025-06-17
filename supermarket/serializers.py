from core.models import System, UserRole, Employee
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import (
    Product,
    StockChange,
    Sale,
    SaleItem,
    Discount,
    Supplier,
    PurchaseOrder,
    GoodsReceiving,
    ProductBatch,
)
from django.utils import timezone
from decimal import Decimal
import time
from django.shortcuts import get_object_or_404
from datetime import datetime
from django.db import transaction
from django.db.models import F


class InventorysupItemSerializer(serializers.ModelSerializer):
    def validate_category(self, value):
        if not value.strip():
            raise serializers.ValidationError("Category cannot be empty")
        return value

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "barcode",
            "price",
            "cost",
            "stock_quantity",
            "minimum_stock",
            "expiry_date",
            "image",
            "category",
            "discount_percentage",
        ]
        extra_kwargs = {
            "minimum_stock": {"required": False, "default": 10},
            "expiry_date": {"required": False, "allow_null": True},
            "image": {"required": False, "allow_null": True},
            "cost": {"required": False, "default": 0},
            "name": {"required": False},
            "price": {"required": False},
            "stock_quantity": {"required": False},
            "barcode": {"required": False},
            "category": {"required": True},
            "discount_percentage": {
                "required": False,
                "min_value": 0,
                "max_value": 100,
            },
        }

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero")
        return value

    def validate_stock_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock quantity cannot be negative")
        return value

    def validate_minimum_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Minimum stock cannot be negative")
        return value

    def update(self, instance, validated_data):
        # Only update the fields that were provided in the request
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class StockChangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockChange
        fields = "__all__"


class StockUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["stock_quantity"]


class ProductBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductBatch
        fields = [
            "id",
            "product",
            "purchase_order",
            "quantity",
            "expiry_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ProductSerializer(serializers.ModelSerializer):
    batches = ProductBatchSerializer(many=True, read_only=True)
    expiring_batches = serializers.SerializerMethodField()
    newest_batch = serializers.SerializerMethodField()
    oldest_batch = serializers.SerializerMethodField()
    batch_groups = serializers.SerializerMethodField()
    stock_by_date = serializers.SerializerMethodField()
    stock_by_expiry = serializers.SerializerMethodField()
    image = serializers.ImageField(required=False, allow_null=True)
    category = serializers.CharField(max_length=100)
    available_categories = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "barcode",
            "price",
            "cost",
            "stock_quantity",
            "minimum_stock",
            "expiry_date",
            "image",
            "batches",
            "batch_groups",
            "expiring_batches",
            "newest_batch",
            "oldest_batch",
            "stock_by_date",
            "stock_by_expiry",
            "category",
            "available_categories",
        ]
        read_only_fields = ["barcode"]

    def get_batch_groups(self, obj):
        """Group batches by expiry date"""
        from django.utils import timezone
        from datetime import timedelta

        today = timezone.now().date()
        batches = obj.batches.filter(quantity__gt=0).order_by("expiry_date")

        groups = {
            "expired": [],
            "expiring_soon": [],  # Within 7 days
            "expiring_later": [],  # More than 7 days
            "no_expiry": [],  # No expiry date set
        }

        for batch in batches:
            if not batch.expiry_date:
                groups["no_expiry"].append(ProductBatchSerializer(batch).data)
            elif batch.expiry_date < today:
                groups["expired"].append(ProductBatchSerializer(batch).data)
            elif batch.expiry_date <= today + timedelta(days=7):
                groups["expiring_soon"].append(ProductBatchSerializer(batch).data)
            else:
                groups["expiring_later"].append(ProductBatchSerializer(batch).data)

        return groups

    def get_expiring_batches(self, obj):
        batches = obj.get_expiring_batches()
        return ProductBatchSerializer(batches, many=True).data

    def get_newest_batch(self, obj):
        batch = obj.get_newest_batch()
        return ProductBatchSerializer(batch).data if batch else None

    def get_oldest_batch(self, obj):
        batch = obj.get_oldest_batch()
        return ProductBatchSerializer(batch).data if batch else None

    def get_stock_by_date(self, obj):
        """Get stock quantities grouped by received date"""
        return obj.get_stock_by_date()

    def get_stock_by_expiry(self, obj):
        """Get stock quantities grouped by expiry date"""
        return obj.get_stock_by_expiry()

    def get_available_categories(self, obj):
        """Get all available categories for the system"""
        # Get default categories
        default_categories = dict(Product.CATEGORY_CHOICES)

        # Get custom categories used in the system
        custom_categories = (
            Product.objects.filter(system=obj.system)
            .exclude(category__in=default_categories.values())
            .values_list("category", flat=True)
            .distinct()
        )

        return {"default": default_categories, "custom": list(custom_categories)}

    def validate_category(self, value):
        if not value.strip():
            raise serializers.ValidationError("Category cannot be empty")
        return value


class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    original_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    discounted_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = SaleItem
        fields = [
            "id",
            "product",
            "product_name",
            "quantity",
            "unit_price",
            "original_price",
            "discounted_price",
            "discount_amount",
            "total_price",
        ]

    def validate(self, data):
        product = data.get("product")
        quantity = data.get("quantity")

        if product and quantity:
            # Get the original price
            original_price = product.price

            # Calculate discounted price if product has a discount
            discounted_price = original_price
            if product.discount_percentage > 0:
                discount_amount = original_price * (product.discount_percentage / 100)
                discounted_price = original_price - discount_amount

            # Set the unit price to the discounted price
            data["unit_price"] = discounted_price
            data["unit_cost"] = product.cost
            data["discount_amount"] = original_price - discounted_price
            data["total_price"] = discounted_price * quantity

        return data


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

    def validate_items(self, items_data):
        for item_data in items_data:
            product = item_data["product"]
            quantity = item_data["quantity"]

            # Check total stock availability
            if product.stock_quantity < quantity:
                raise serializers.ValidationError(
                    f"Not enough stock available for {product.name}. Only {product.stock_quantity} units left."
                )

        return items_data

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        system_id = self.context["system_id"]
        cashier = self.context["cashier"]

        # Generate receipt number
        receipt_number = f"RCP-{system_id}-{int(time.time())}"

        with transaction.atomic():
            # Create the sale
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

                # Set unit price from product's price and calculate total
                item_data["unit_price"] = product.price
                item_data["total_price"] = (product.price * quantity) - item_data.get(
                    "discount_amount", Decimal("0")
                )

                # Create sale item
                SaleItem.objects.create(sale=sale, **item_data)

                # Update stock quantity
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


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ["id", "name", "phone", "email", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        request = self.context["request"]
        system_id = self.context["view"].kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)
        validated_data["system"] = system
        return super().create(validated_data)

    def validate_phone(self, value):
        if not value.startswith("+"):
            value = "+" + value
        return value


class CustomDateField(serializers.DateField):
    def to_internal_value(self, value):
        if isinstance(value, datetime):
            return value.date()
        return super().to_internal_value(value)

    def to_representation(self, value):
        if isinstance(value, datetime):
            return value.date()
        return super().to_representation(value)


class PurchaseOrderSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    total_received = serializers.SerializerMethodField()
    expected_delivery_date = CustomDateField(required=False, allow_null=True)
    supplier_id = serializers.IntegerField(write_only=True)
    product_id = serializers.IntegerField(write_only=True)
    order_date = CustomDateField(required=False)
    created_at = CustomDateField(read_only=True)
    updated_at = CustomDateField(read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = [
            "id",
            "system",
            "supplier",
            "supplier_id",
            "supplier_name",
            "product",
            "product_id",
            "product_name",
            "quantity",
            "cost",
            "order_date",
            "expected_delivery_date",
            "status",
            "created_at",
            "updated_at",
            "total_received",
        ]
        read_only_fields = [
            "id",
            "status",
            "created_at",
            "updated_at",
            "system",
            "supplier",
            "product",
        ]

    def get_total_received(self, obj):
        return sum(gr.received_quantity for gr in obj.goods_receiving.all())

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero")
        return value

    def validate_cost(self, value):
        if value <= 0:
            raise serializers.ValidationError("Cost must be greater than zero")
        return value

    def validate_order_date(self, value):
        if value > timezone.now().date():
            raise serializers.ValidationError("Order date cannot be in the future")
        return value

    def validate(self, data):
        # Set default order_date to today if not provided
        if not data.get("order_date"):
            data["order_date"] = timezone.now().date()

        # Set default expected_delivery_date if not provided or null
        if not data.get("expected_delivery_date"):
            data["expected_delivery_date"] = data["order_date"] + timezone.timedelta(
                days=7
            )

        # Validate expected_delivery_date is after order_date
        if data["expected_delivery_date"] < data["order_date"]:
            raise serializers.ValidationError(
                "Expected delivery date must be after order date"
            )

        return data

    def create(self, validated_data):
        system_id = self.context["view"].kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)

        # Get supplier and product objects
        supplier_id = validated_data.pop("supplier_id")
        product_id = validated_data.pop("product_id")

        supplier = get_object_or_404(Supplier, id=supplier_id)
        product = get_object_or_404(Product, id=product_id)

        validated_data["system"] = system
        validated_data["supplier"] = supplier
        validated_data["product"] = product
        validated_data["status"] = "pending"

        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Handle supplier_id if provided
        if "supplier_id" in validated_data:
            supplier_id = validated_data.pop("supplier_id")
            supplier = get_object_or_404(Supplier, id=supplier_id)
            instance.supplier = supplier

        # Handle product_id if provided
        if "product_id" in validated_data:
            product_id = validated_data.pop("product_id")
            product = get_object_or_404(Product, id=product_id)
            instance.product = product

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class GoodsReceivingSerializer(serializers.ModelSerializer):
    purchase_order_details = PurchaseOrderSerializer(
        source="purchase_order", read_only=True
    )
    purchase_order_id = serializers.IntegerField(write_only=True, required=False)
    received_date = CustomDateField()
    expiry_date = CustomDateField(required=False, allow_null=True)
    batch_details = ProductBatchSerializer(
        source="purchase_order.batches", many=True, read_only=True
    )

    class Meta:
        model = GoodsReceiving
        fields = [
            "id",
            "purchase_order",
            "purchase_order_id",
            "purchase_order_details",
            "received_quantity",
            "received_date",
            "expiry_date",
            "location",
            "created_at",
            "updated_at",
            "batch_details",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "purchase_order"]

    def validate_received_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Received quantity must be greater than zero"
            )
        return value

    def validate_received_date(self, value):
        if isinstance(value, datetime):
            value = value.date()
        if value > timezone.now().date():
            raise serializers.ValidationError("Received date cannot be in the future")
        return value

    def validate(self, data):
        po_id = data.get("purchase_order_id")
        received_quantity = data.get("received_quantity")
        received_date = data.get("received_date")
        expiry_date = data.get("expiry_date")

        # Get purchase order
        if self.instance:  # If updating existing record
            po = self.instance.purchase_order
        else:  # If creating new record
            if not po_id:
                raise serializers.ValidationError(
                    {"purchase_order_id": "This field is required"}
                )
            try:
                po = PurchaseOrder.objects.get(id=po_id)
            except PurchaseOrder.DoesNotExist:
                raise serializers.ValidationError(
                    {"purchase_order_id": "Purchase order does not exist"}
                )

        # Convert dates to date objects if they are datetime
        if isinstance(received_date, datetime):
            received_date = received_date.date()
        if isinstance(expiry_date, datetime):
            expiry_date = expiry_date.date()
        if isinstance(po.order_date, datetime):
            po_order_date = po.order_date.date()
        else:
            po_order_date = po.order_date

        # Validate received_date is not before order_date
        if received_date < po_order_date:
            raise serializers.ValidationError(
                "Received date cannot be before order date"
            )

        # Validate received_quantity doesn't exceed remaining quantity
        total_received = sum(gr.received_quantity for gr in po.goods_receiving.all())
        if self.instance:  # If updating, subtract current record's quantity
            total_received -= self.instance.received_quantity
        remaining_quantity = po.quantity - total_received

        if received_quantity > remaining_quantity:
            raise serializers.ValidationError(
                f"Received quantity ({received_quantity}) exceeds remaining "
                f"quantity ({remaining_quantity})"
            )

        # Validate expiry_date is in the future if provided
        if expiry_date and expiry_date <= timezone.now().date():
            raise serializers.ValidationError("Expiry date must be in the future")

        # Set default location if not provided
        if not data.get("location"):
            data["location"] = "Main Warehouse"

        # Add purchase order to validated data
        data["purchase_order"] = po

        return data

    def create(self, validated_data):
        # Remove purchase_order_id as it's not a model field
        validated_data.pop("purchase_order_id", None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Remove purchase_order_id as it's not a model field
        validated_data.pop("purchase_order_id", None)
        return super().update(instance, validated_data)


class PublicProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "price",
            "cost",
            "stock_quantity",
            "expiry_date",
            "minimum_stock",
            "image",
        ]


# Analytics Serializers by ali for the supermarket
class OrderSummarySerializer(serializers.Serializer):
    day_orders = serializers.IntegerField()
    day_change = serializers.FloatField()
    week_orders = serializers.IntegerField()
    week_change = serializers.FloatField()
    month_orders = serializers.IntegerField()
    month_change = serializers.FloatField()


class OrderTrendSerializer(serializers.Serializer):
    date = serializers.DateField()
    orders = serializers.IntegerField()


class CashierPerformanceSerializer(serializers.Serializer):
    cashier = serializers.CharField()
    orders = serializers.IntegerField()


class PeakHourSerializer(serializers.Serializer):
    hour = serializers.CharField()
    orders = serializers.IntegerField()


class ProductBarcodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "barcode",
            "price",
            "cost",
            "stock_quantity",
            "minimum_stock",
            "expiry_date",
            "image",
            "discount_percentage",
        ]
