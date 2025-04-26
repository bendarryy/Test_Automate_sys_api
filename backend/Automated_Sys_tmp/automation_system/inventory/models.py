from django.db import models
from core.models import System  # or Restaurant if you renamed it


class InventoryItem(models.Model):
    restaurant = models.ForeignKey(
        System, on_delete=models.CASCADE, related_name="inventory"
    )
    name = models.CharField(max_length=100)
    quantity = models.PositiveIntegerField(default=0)
    unit = models.CharField(max_length=20, default="pcs")
    min_threshold = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_low(self):
        return self.quantity <= self.min_threshold

    def __str__(self):
        return f"{self.name} ({self.quantity} {self.unit})"
