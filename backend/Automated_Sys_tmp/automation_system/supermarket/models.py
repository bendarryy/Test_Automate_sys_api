from django.db import models
from core.models import System, Employee
import time
from django.core.validators import RegexValidator

# Create your models here.


class Product(models.Model):
    """Products in supermarkets"""

    system = models.ForeignKey(
        System, on_delete=models.CASCADE, related_name="products"
    )
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.PositiveIntegerField()
    expiry_date = models.DateField(blank=True, null=True)
    minimum_stock = models.PositiveIntegerField(default=10)


class StockChange(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="stock_changes"
    )
    quantity_changed = models.IntegerField()
    change_type = models.CharField(
        max_length=10, choices=[("add", "Add"), ("remove", "Remove")]
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )  # This is the correct field for timestamp

    def __str__(self):
        return f"{self.change_type} - {self.product.name} ({self.quantity_changed})"


class Sale(models.Model):
    """Sales transactions in supermarkets"""

    PAYMENT_CHOICES = [
        ("cash", "Cash"),
        ("card", "Card"),
    ]

    system = models.ForeignKey(
        System, on_delete=models.CASCADE, related_name="sales", null=True, blank=True
    )
    cashier = models.ForeignKey(
        Employee, on_delete=models.SET_NULL, null=True, related_name="sales"
    )
    total_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_type = models.CharField(max_length=10, choices=PAYMENT_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    receipt_number = models.CharField(max_length=50, unique=True, null=True, blank=True)
    vat_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    vat_rate = models.DecimalField(
        max_digits=5, decimal_places=2, default=0.16
    )  # 16% VAT

    def __str__(self):
        return f"Sale #{self.receipt_number} - {self.created_at}"

    def save(self, *args, **kwargs):
        if not self.receipt_number:
            # Generate a unique receipt number
            timestamp = int(time.time())
            self.receipt_number = f"RCP-{self.system.id}-{timestamp}"
        super().save(*args, **kwargs)

    def calculate_total(self):
        """Calculate total price including VAT and discounts"""
        from decimal import Decimal

        subtotal = sum(item.total_price for item in self.items.all())
        # Convert vat_rate to Decimal if needed
        self.vat_amount = subtotal * Decimal(str(self.vat_rate))
        self.total_price = (
            subtotal + self.vat_amount - Decimal(str(self.discount_amount))
        )
        self.save()


class SaleItem(models.Model):
    """Individual items in a sale"""

    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )

    def save(self, *args, **kwargs):
        # Calculate total price for this item
        if self.unit_price is not None:
            self.total_price = (self.unit_price * self.quantity) - self.discount_amount
        super().save(*args, **kwargs)


class Discount(models.Model):
    """Discounts that can be applied to products or entire sales"""

    DISCOUNT_TYPES = [
        ("product", "Product Discount"),
        ("order", "Order Discount"),
    ]

    system = models.ForeignKey(
        System, on_delete=models.CASCADE, related_name="discounts"
    )
    name = models.CharField(max_length=100)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPES)
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, null=True, blank=True
    )
    percentage = models.DecimalField(max_digits=5, decimal_places=2)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.percentage}%"


class Supplier(models.Model):
    system = models.ForeignKey(
        System, on_delete=models.CASCADE, related_name="suppliers"
    )
    name = models.CharField(max_length=100)
    phone = models.CharField(
        max_length=20,
        validators=[
            RegexValidator(
                regex=r"^\+?1?\d{9,15}$",
                message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.",
            )
        ],
    )
    email = models.EmailField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.system.name}"

    class Meta:
        unique_together = ("system", "name")


class PurchaseOrder(models.Model):
    """Purchase Orders for suppliers"""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("partially_received", "Partially Received"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    system = models.ForeignKey(
        System, on_delete=models.CASCADE, related_name="purchase_orders"
    )
    supplier = models.ForeignKey(
        Supplier, on_delete=models.PROTECT, related_name="purchase_orders"
    )
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="purchase_orders"
    )
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    order_date = models.DateTimeField(auto_now_add=True)
    expected_delivery_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"PO-{self.id} - {self.supplier.name} - {self.product.name}"

    def save(self, *args, **kwargs):
        if not self.expected_delivery_date:
            # Set default delivery date to 7 days from order date
            from datetime import timedelta

            self.expected_delivery_date = self.order_date + timedelta(days=7)
        super().save(*args, **kwargs)


class GoodsReceiving(models.Model):
    """Goods Receiving records for Purchase Orders"""

    purchase_order = models.ForeignKey(
        PurchaseOrder, on_delete=models.PROTECT, related_name="goods_receiving"
    )
    received_quantity = models.PositiveIntegerField()
    received_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=100, default="Main Warehouse")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"GR-{self.id} - PO-{self.purchase_order.id}"

    def save(self, *args, **kwargs):
        # Update PO status based on received quantity
        po = self.purchase_order
        total_received = sum(gr.received_quantity for gr in po.goods_receiving.all())

        if total_received >= po.quantity:
            po.status = "completed"
        elif total_received > 0:
            po.status = "partially_received"
        po.save()

        # Update product stock
        product = po.product
        product.stock_quantity += self.received_quantity
        product.save()

        super().save(*args, **kwargs)
