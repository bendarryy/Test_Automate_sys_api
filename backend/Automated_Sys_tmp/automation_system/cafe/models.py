from django.db import models
from core.models import System

class CafeMenuItem(models.Model):
    """Menu items for cafes"""
    system = models.ForeignKey(System, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
