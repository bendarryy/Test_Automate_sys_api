from django.db import models
from core.models import System

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

    system = models.ForeignKey(System, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity_sold = models.PositiveIntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
