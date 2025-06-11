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
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock_quantity = models.PositiveIntegerField(default=0)
    expiry_date = models.DateField(blank=True, null=True)
    minimum_stock = models.PositiveIntegerField(default=10)
    received_date = models.DateField(auto_now_add=True)  # Track when stock was received
    image = models.ImageField(upload_to="product_images/", null=True, blank=True)

    def __str__(self):
        return f"{self.name} - {self.system.name}"

    def get_total_stock(self):
        """Calculate total stock from all batches"""
        return sum(batch.quantity for batch in self.batches.all())

    def get_expiring_batches(self, days=30):
        """Get batches expiring within specified days"""
        from django.utils import timezone
        from datetime import timedelta

        expiry_date = timezone.now().date() + timedelta(days=days)
        return self.batches.filter(expiry_date__lte=expiry_date, quantity__gt=0)

    def get_newest_batch(self):
        """Get the newest batch with available stock"""
        return self.batches.filter(quantity__gt=0).order_by("-created_at").first()

    def get_oldest_batch(self):
        """Get the oldest batch with available stock"""
        return self.batches.filter(quantity__gt=0).order_by("created_at").first()

    def get_earliest_expiry_date(self):
        """Get the earliest expiry date from all batches with stock"""
        earliest_batch = (
            self.batches.filter(quantity__gt=0).order_by("expiry_date").first()
        )
        return earliest_batch.expiry_date if earliest_batch else None

    def save(self, *args, **kwargs):
        # Only update stock and expiry if the product already exists
        if self.pk:
            # Update total stock quantity from batches
            self.stock_quantity = self.get_total_stock()
            # Update expiry date to earliest batch expiry
            self.expiry_date = self.get_earliest_expiry_date()
        super().save(*args, **kwargs)

    def get_stock_by_date(self):
        """Get stock quantities grouped by received date"""
        from django.db.models import Sum
        from django.utils import timezone
        from datetime import timedelta

        today = timezone.now().date()
        stock_groups = {
            "new": 0,  # Stock received in last 7 days
            "recent": 0,  # Stock received in last 30 days
            "old": 0,  # Stock older than 30 days
        }

        # Get all goods receiving records for this product
        receiving_records = GoodsReceiving.objects.filter(
            purchase_order__product=self
        ).order_by("received_date")

        for record in receiving_records:
            days_old = (today - record.received_date).days
            if days_old <= 7:
                stock_groups["new"] += record.received_quantity
            elif days_old <= 30:
                stock_groups["recent"] += record.received_quantity
            else:
                stock_groups["old"] += record.received_quantity

        return stock_groups

    def get_stock_by_expiry(self):
        """Get stock quantities grouped by expiry date"""
        from django.utils import timezone
        from datetime import timedelta

        today = timezone.now().date()
        expiry_groups = {
            "expired": 0,
            "expiring_soon": 0,  # Within 7 days
            "expiring_later": 0,  # More than 7 days
        }

        # Get all goods receiving records for this product
        receiving_records = GoodsReceiving.objects.filter(purchase_order__product=self)

        for record in receiving_records:
            if not record.expiry_date:
                continue
            days_to_expiry = (record.expiry_date - today).days
            if days_to_expiry < 0:
                expiry_groups["expired"] += record.received_quantity
            elif days_to_expiry <= 7:
                expiry_groups["expiring_soon"] += record.received_quantity
            else:
                expiry_groups["expiring_later"] += record.received_quantity

        return expiry_groups


class ProductBatch(models.Model):
    """Tracks different batches of products with their expiry dates"""

    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="batches"
    )
    purchase_order = models.ForeignKey(
        "PurchaseOrder", on_delete=models.CASCADE, related_name="batches"
    )
    quantity = models.PositiveIntegerField()
    expiry_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.name} - Batch {self.id} (Exp: {self.expiry_date})"

    class Meta:
        ordering = ["expiry_date", "created_at"]


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
        Product, on_delete=models.SET_NULL, related_name="purchase_orders", null=True
    )
    quantity = models.PositiveIntegerField()
    cost = models.DecimalField(max_digits=10, decimal_places=2)
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
        PurchaseOrder, on_delete=models.CASCADE, related_name="goods_receiving"
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

        # If this is an update, subtract the old quantity
        if self.pk:
            old_record = GoodsReceiving.objects.get(pk=self.pk)
            total_received -= old_record.received_quantity

        # Add the new quantity
        total_received += self.received_quantity

        # Update PO status
        if total_received >= po.quantity:
            po.status = "completed"
        elif total_received > 0:
            po.status = "partially_received"
        else:
            po.status = "pending"
        po.save()

        # Create or update product batch
        product = po.product
        if self.pk:
            # If updating, subtract the old quantity from the batch
            old_record = GoodsReceiving.objects.get(pk=self.pk)
            old_batch = ProductBatch.objects.get(
                product=product, purchase_order=po, expiry_date=old_record.expiry_date
            )
            old_batch.quantity -= old_record.received_quantity
            old_batch.save()

        # Create or update batch with new quantity
        batch, created = ProductBatch.objects.get_or_create(
            product=product,
            purchase_order=po,
            expiry_date=self.expiry_date,
            defaults={"quantity": self.received_quantity},
        )
        if not created:
            batch.quantity += self.received_quantity
            batch.save()

        # Update product total stock without changing cost
        product.save()  # This will update total stock quantity from batches

        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Update batch quantity before deleting
        batch = ProductBatch.objects.get(
            product=self.purchase_order.product,
            purchase_order=self.purchase_order,
            expiry_date=self.expiry_date,
        )
        batch.quantity -= self.received_quantity
        batch.save()

        # Update PO status
        po = self.purchase_order
        total_received = (
            sum(gr.received_quantity for gr in po.goods_receiving.all())
            - self.received_quantity
        )
        if total_received >= po.quantity:
            po.status = "completed"
        elif total_received > 0:
            po.status = "partially_received"
        else:
            po.status = "pending"
        po.save()

        # Update product total stock
        product = po.product
        product.save()  # This will update total stock quantity from batches

        super().delete(*args, **kwargs)
