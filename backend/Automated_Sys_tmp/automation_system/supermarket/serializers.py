from core.models import System, UserRole, Employee
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Product, StockChange


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
