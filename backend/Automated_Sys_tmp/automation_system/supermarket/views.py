from django.shortcuts import get_object_or_404, render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import F
from datetime import date, timedelta

from .models import System, Product, StockChange, Sale, SaleItem, Discount, Employee
from .serializers import (
    InventorysupItemSerializer,
    StockUpdateSerializer,
    StockChangeSerializer,
    ProductSerializer,
    SaleSerializer,
    SaleCreateSerializer,
    ApplyDiscountSerializer,
)
from core.permissions import IsSystemOwner, IsEmployeeRolePermission
from rest_framework.permissions import OR


class InventoryItemViewSet(viewsets.ModelViewSet):
    serializer_class = InventorysupItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        system_id = self.kwargs.get("system_id")
        user = self.request.user

        # Make sure the system belongs to the authenticated user
        try:
            system = System.objects.get(id=system_id, owner=user)
        except System.DoesNotExist:
            raise PermissionDenied(
                "You do not have permission to access this system's inventory."
            )

        return Product.objects.filter(system=system)

    def perform_create(self, serializer):
        system_id = self.kwargs.get("system_id")
        user = self.request.user

        try:
            system = System.objects.get(id=system_id, owner=user)
        except System.DoesNotExist:
            raise PermissionDenied(
                "You do not have permission to add inventory to this system."
            )

        serializer.save(system=system)

    def perform_update(self, serializer):
        system = serializer.instance.system
        if system.owner != self.request.user:
            raise PermissionDenied(
                "You do not have permission to update inventory in this system."
            )
        serializer.save()

    def perform_destroy(self, instance):
        system = instance.system
        if system.owner != self.request.user:
            raise PermissionDenied(
                "You do not have permission to delete inventory from this system."
            )
        instance.delete()

    @action(detail=False, methods=["get"])
    def low_stock(self, request, system_id=None):
        system = self._get_system_or_403(system_id)
        products = Product.objects.filter(
            system=system, stock_quantity__lt=F("minimum_stock")
        )
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="expiring-soon")
    def expiring_soon(self, request, system_id=None):

        try:
            system = System.objects.get(id=system_id, owner=request.user)
        except System.DoesNotExist:
            return Response(
                {"detail": "System not found."}, status=status.HTTP_403_FORBIDDEN
            )

        days_ahead = int(request.query_params.get("days", 7))
        today = date.today()
        soon = today + timedelta(days=days_ahead)

        expiring_products = Product.objects.filter(
            system=system, expiry_date__gte=today, expiry_date__lte=soon
        )

        serializer = ProductSerializer(
            expiring_products, many=True, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="stock-history")
    def stock_history(self, request, system_id=None):
        system = get_object_or_404(System, id=system_id, owner=request.user)

        # Get stock changes related to the products in the system
        stock_changes = StockChange.objects.filter(product__system=system).order_by(
            "-created_at"
        )  # Use 'created_at' instead of 'timestamp'

        # Check if we have any stock changes
        if not stock_changes:
            return Response({"message": "No stock changes found"}, status=200)

        # Serialize the stock changes
        serializer = StockChangeSerializer(stock_changes, many=True)

        # Return the response with serialized data
        return Response(serializer.data)

    @action(detail=True, methods=["patch"], url_path="stock")
    def update_stock(self, request, system_id=None, pk=None):
        system = get_object_or_404(System, id=system_id, owner=request.user)
        product = get_object_or_404(Product, id=pk, system=system)

        serializer = StockUpdateSerializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)

    def _get_system_or_403(self, system_id):
        """
        Fetch the System by ID, ensure it belongs to the current user,
        or raise PermissionDenied.
        """
        try:
            return System.objects.get(id=system_id, owner=self.request.user)
        except System.DoesNotExist:
            raise PermissionDenied("You do not have permission for this system.")

    @action(detail=False, methods=["get"], url_path="expired")
    def expired_products(self, request, system_id=None):
        today = date.today()
        expired_products = Product.objects.filter(
            system_id=system_id, expiry_date__lt=today
        )

        serializer = ProductSerializer(
            expired_products, many=True, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def get_permissions(self):
        """
        Define permission rules for each action.
        """
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [
                IsAuthenticated(),
                OR(IsSystemOwner(), IsEmployeeRolePermission("manager", "head chef")),
            ]

        if self.action == "expired_products":  # Custom action name
            return [
                IsAuthenticated(),
                OR(IsSystemOwner(), IsEmployeeRolePermission("manager")),
            ]

        return [IsAuthenticated(), OR(IsSystemOwner(), IsEmployeeRolePermission())]


class SaleViewSet(viewsets.ModelViewSet):
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        system_id = self.kwargs.get("system_id")
        user = self.request.user

        # Make sure the system belongs to the authenticated user
        try:
            system = System.objects.get(id=system_id, owner=user)
        except System.DoesNotExist:
            raise PermissionDenied(
                "You do not have permission to access this system's sales."
            )

        return Sale.objects.filter(system=system).order_by("-created_at")

    def get_serializer_class(self):
        if self.action == "create":
            return SaleCreateSerializer
        return SaleSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["system_id"] = self.kwargs.get("system_id")
        user = self.request.user

        # Try to get the cashier (employee) making the sale
        try:
            context["cashier"] = Employee.objects.get(user=user)
        except Employee.DoesNotExist:
            # If user is not an employee but is the owner, proceed without cashier
            try:
                System.objects.get(id=context["system_id"], owner=user)
                context["cashier"] = None
            except System.DoesNotExist:
                context["cashier"] = None

        return context

    def perform_create(self, serializer):
        system_id = self.kwargs.get("system_id")
        user = self.request.user

        try:
            system = System.objects.get(id=system_id, owner=user)
        except System.DoesNotExist:
            raise PermissionDenied(
                "You do not have permission to create sales in this system."
            )

        # Get cashier from context
        cashier = serializer.context.get("cashier")

        # If no cashier and user is not the owner, deny permission
        if not cashier and system.owner != user:
            raise PermissionDenied("Only employees or system owners can create sales.")

        # Create the sale without passing cashier (it's already in the context)
        serializer.save(system=system)

    @action(detail=True, methods=["get"])
    def receipt(self, request, system_id=None, pk=None):
        sale = self.get_object()

        # Render the receipt template
        context = {
            "sale": sale,
            "items": sale.items.all(),
            "store_name": sale.system.name,
            "date": sale.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        }

        # Return HTML response
        return render(request, "supermarket/receipt.html", context)

    @action(detail=True, methods=["patch"])
    def apply_discount(self, request, system_id=None, pk=None):
        sale = self.get_object()
        serializer = ApplyDiscountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        discount = Discount.objects.get(id=serializer.validated_data["discount_id"])

        if discount.discount_type == "product":
            # Apply discount to specific products
            for item in sale.items.filter(product=discount.product):
                item.discount_amount = (
                    item.unit_price * item.quantity * (discount.percentage / 100)
                )
                item.save()
        else:
            # Apply discount to entire sale
            sale.discount_amount = sale.total_price * (discount.percentage / 100)
            sale.save()

        # Recalculate total
        sale.calculate_total()

        return Response(SaleSerializer(sale).data)
