from django.shortcuts import get_object_or_404, render
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.exceptions import PermissionDenied, ValidationError
from django.db import transaction
from django.utils import timezone
from datetime import date, timedelta, datetime
from django.db.models import F, Q, Count
from django.db.models.functions import TruncDate, TruncHour

from core.models import System, Employee
from .models import (
    Product,
    StockChange,
    Sale,
    Discount,
    Supplier,
    PurchaseOrder,
    GoodsReceiving,
)
from .serializers import (
    ApplyDiscountSerializer,
    InventorysupItemSerializer,
    SaleSerializer,
    SaleCreateSerializer,
    SupplierSerializer,
    PurchaseOrderSerializer,
    GoodsReceivingSerializer,
    OrderSummarySerializer,
    OrderTrendSerializer,
    CashierPerformanceSerializer,
    PeakHourSerializer,
    ProductBarcodeSerializer,
    StockChangeSerializer,
    StockUpdateSerializer,
    ProductSerializer,
)
from core.permissions import IsSystemOwner, IsEmployeeRolePermission
from rest_framework.permissions import OR
from core.serializers import PublicSystemSerializer
from core.pagination import CustomPagination


class InventoryItemViewSet(viewsets.ModelViewSet):
    serializer_class = InventorysupItemSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        - Owners, managers, and cashiers have full access to all product actions.
        """
        return [
            IsAuthenticated(),
            OR(
                IsSystemOwner(),
                OR(
                    IsEmployeeRolePermission("manager_supermarket"),
                    IsEmployeeRolePermission("cashier_supermarket")
                )
            )
        ]

    def get_queryset(self):
        """
        Returns the queryset for this view.
        Permissions are handled by `get_permissions`, so we only need to filter.
        """
        system_id = self.kwargs.get("system_id")
        return Product.objects.filter(system_id=system_id)

    @transaction.atomic
    def perform_create(self, serializer):
        """
        Handles the creation of a new product.
        Permissions are already verified.
        """
        system_id = self.kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)

        # Create the product using serializer's save method
        product = serializer.save(system=system)

        # Generate barcode if not already set
        if not product.barcode:
            product.generate_barcode()
            product.save()

        # Create initial stock change record
        StockChange.objects.create(
            product=product, quantity_changed=product.stock_quantity, change_type="add"
        )

        return product

    def perform_update(self, serializer):
        # Permissions are handled by get_permissions, so we just save.
        serializer.save()

    def perform_destroy(self, instance):
        # Permissions are handled by get_permissions, so we just delete.
        instance.delete()

    @action(detail=False, methods=["get"])
    def low_stock(self, request, system_id=None):
        # _get_system_or_403 is no longer needed as permissions are checked globally.
        products = self.get_queryset().filter(stock_quantity__lt=F("minimum_stock"))
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="expiring-soon")
    def expiring_soon(self, request, system_id=None):
        try:
            days_ahead = int(request.query_params.get("days", 7))
            if days_ahead <= 0:
                return Response(
                    {"detail": "Days parameter must be a positive number."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except ValueError:
            return Response(
                {"detail": "Invalid days parameter. Must be a number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        today = date.today()
        soon = today + timedelta(days=days_ahead)

        expiring_products = self.get_queryset().filter(
            Q(expiry_date__gte=today, expiry_date__lte=soon) |
            Q(batches__expiry_date__gte=today, batches__expiry_date__lte=soon)
        ).distinct()

        serializer = ProductSerializer(expiring_products, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="stock-history")
    def stock_history(self, request, system_id=None):
        stock_changes = StockChange.objects.filter(product__system_id=system_id).order_by("-created_at")
        if not stock_changes:
            return Response({"message": "No stock changes found"}, status=200)
        serializer = StockChangeSerializer(stock_changes, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["patch"], url_path="stock")
    def update_stock(self, request, system_id=None, pk=None):
        product = self.get_object()
        serializer = StockUpdateSerializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="costs")
    def cost_analysis(self, request, system_id=None):
        products = self.get_queryset()
        result = []
        for product in products:
            purchase_orders = PurchaseOrder.objects.filter(
                product=product, status__in=["completed", "partially_received"]
            ).order_by("-order_date")
            cost_groups = {}
            for po in purchase_orders:
                cost = po.cost
                price = product.price
                profit = price - cost
                group_key = f"{cost}"
                if group_key not in cost_groups:
                    cost_groups[group_key] = {
                        "cost": cost,
                        "price": price,
                        "profit": profit,
                        "total_quantity": 0,
                        "purchase_orders": [],
                    }
                cost_groups[group_key]["purchase_orders"].append({
                    "id": po.id,
                    "order_date": po.order_date,
                    "quantity": po.quantity,
                    "status": po.status,
                })
                cost_groups[group_key]["total_quantity"] += po.quantity
            
            product_cost_groups = list(cost_groups.values())
            
            result.append({
                "product_id": product.id,
                "product_name": product.name,
                "cost_groups": product_cost_groups
            })
            
        return Response(result)
    
    @action(detail=False, methods=["get"], url_path="expired")
    def expired_products(self, request, system_id=None):
        today = date.today()
        expired_products = self.get_queryset().filter(expiry_date__lt=today)
        serializer = self.get_serializer(expired_products, many=True)
        return Response(serializer.data)
        
    def get_serializer_context(self):
        """
        Extra context provided to the serializer class.
        """
        return {"request": self.request}


class SaleViewSet(viewsets.ModelViewSet):
    serializer_class = SaleSerializer

    def get_permissions(self):
        """
        Role-based access control for sales actions.
        - Owners, supermarket managers, and cashiers have full access.
        - All other authenticated employees have read-only access.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'apply_discount']:
            # Write actions
            return [
                IsAuthenticated(),
                OR(IsSystemOwner(), IsEmployeeRolePermission("manager_supermarket", "cashier_supermarket"))
            ]
        else:
            # Read-only actions for any authenticated employee of the system
            return [IsAuthenticated(), OR(IsSystemOwner(), IsEmployeeRolePermission())]

    def get_queryset(self):
        """
        Returns the queryset for this view.
        Permissions are handled by `get_permissions`.
        """
        system_id = self.kwargs.get("system_id")
        return (
            Sale.objects.filter(system_id=system_id, items__product__isnull=False)
            .distinct()
            .order_by("-created_at")
        )

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
        """
        Creates a sale. Permissions and cashier context are already handled.
        """
        system_id = self.kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)
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
        # return
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

    @action(detail=False, methods=["get"])
    def daily_profit(self, request, system_id=None):
        """Calculate daily profit with optional product filtering.
           Permissions are handled by get_permissions."""
        date = request.query_params.get("date")
        product_id = request.query_params.get("product_id")

        try:
            date = (
                datetime.strptime(date, "%Y-%m-%d").date()
                if date
                else timezone.now().date()
            )
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get all sales for the date
        sales = self.get_queryset().filter(created_at__date=date)

        if product_id:
            sales = sales.filter(items__product_id=product_id)

        # Calculate profits for each sale item
        product_totals = {}
        total_sales = 0
        total_profit = 0
        total_discount = 0

        for sale in sales:
            for item in sale.items.all():
                if not item.product:
                    continue
                if None in (item.unit_price, item.unit_cost, item.quantity, item.discount_amount, item.total_price):
                    continue

                product = item.product
                if product.name not in product_totals:
                    product_totals[product.name] = {
                        "total_profit": 0,
                        "total_quantity_sold": 0,
                        "total_sales": 0,
                        "total_discount": 0,
                        "sales": [],
                    }

                # Calculate profit using the actual unit price (which includes discounts)
                profit = (item.unit_price - item.unit_cost) * item.quantity
                discount = item.discount_amount * item.quantity

                product_totals[product.name]["total_profit"] += profit
                product_totals[product.name]["total_quantity_sold"] += item.quantity
                product_totals[product.name]["total_sales"] += item.total_price
                product_totals[product.name]["total_discount"] += discount

                # Add sale details
                product_totals[product.name]["sales"].append(
                    {
                        "product_id": product.id,
                        "product_name": product.name,
                        "quantity_sold": item.quantity,
                        "unit_price": item.unit_price,
                        "original_price": item.unit_price + item.discount_amount,
                        "discount_amount": item.discount_amount,
                        "unit_cost": item.unit_cost,
                        "profit": profit,
                        "sale_time": sale.created_at.time(),
                    }
                )

                total_sales += item.total_price
                total_profit += profit
                total_discount += discount

        return Response(
            {
                "date": date.strftime("%Y-%m-%d"),
                "total_sales": total_sales,
                "total_profit": total_profit,
                "total_discount": total_discount,
                "products": [
                    {
                        "product_name": name,
                        "total_quantity_sold": data["total_quantity_sold"],
                        "total_profit": data["total_profit"],
                        "total_sales": data["total_sales"],
                        "total_discount": data["total_discount"],
                        "sales": data["sales"],
                    }
                    for name, data in product_totals.items()
                ],
            }
        )

    @action(detail=False, methods=["get"])
    def yearly_profit(self, request, system_id=None):
        """Calculate yearly profits with optional product filtering"""
        year = request.query_params.get("year")
        product_id = request.query_params.get("product_id")

        try:
            year = int(year) if year else timezone.now().year
        except ValueError:
            return Response(
                {"error": "Invalid year format"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Get all sales for the year
        sales = Sale.objects.filter(
            system_id=system_id,
            created_at__year=year,
        )

        if product_id:
            sales = sales.filter(items__product_id=product_id)

        # Calculate profits for each sale item
        product_totals = {}
        total_sales = 0
        total_profit = 0
        total_discount = 0

        for sale in sales:
            for item in sale.items.all():
                if not item.product:
                    continue

                product = item.product
                if product.name not in product_totals:
                    product_totals[product.name] = {
                        "total_profit": 0,
                        "total_quantity_sold": 0,
                        "total_sales": 0,
                        "total_discount": 0,
                        "sales": [],
                    }

                # Calculate profit using the actual unit price (which includes discounts)
                profit = (item.unit_price - item.unit_cost) * item.quantity
                discount = item.discount_amount * item.quantity

                product_totals[product.name]["total_profit"] += profit
                product_totals[product.name]["total_quantity_sold"] += item.quantity
                product_totals[product.name]["total_sales"] += item.total_price
                product_totals[product.name]["total_discount"] += discount

                # Add sale details
                product_totals[product.name]["sales"].append(
                    {
                        "product_id": product.id,
                        "product_name": product.name,
                        "quantity_sold": item.quantity,
                        "unit_price": item.unit_price,
                        "original_price": item.unit_price + item.discount_amount,
                        "discount_amount": item.discount_amount,
                        "unit_cost": item.unit_cost,
                        "profit": profit,
                        "sale_time": sale.created_at.time(),
                    }
                )

                total_sales += item.total_price
                total_profit += profit
                total_discount += discount

        return Response(
            {
                "year": year,
                "total_sales": total_sales,
                "total_profit": total_profit,
                "total_discount": total_discount,
                "products": [
                    {
                        "product_name": name,
                        "total_quantity_sold": data["total_quantity_sold"],
                        "total_profit": data["total_profit"],
                        "total_sales": data["total_sales"],
                        "total_discount": data["total_discount"],
                        "sales": data["sales"],
                    }
                    for name, data in product_totals.items()
                ],
            }
        )


class SupplierViewSet(viewsets.ModelViewSet):
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        system_id = self.kwargs.get("system_id")
        return Supplier.objects.filter(system_id=system_id)

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [
                IsAuthenticated(),
                OR(IsSystemOwner(), IsEmployeeRolePermission("manager_supermarket", "inventory_manager")),
            ]
        return [
            IsAuthenticated(),
            OR(IsSystemOwner(), IsEmployeeRolePermission("manager_supermarket", "inventory_manager")),
        ]

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"message": "Supplier deleted successfully."}, status=status.HTTP_200_OK
        )


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    
    def get_queryset(self):
        system_id = self.kwargs.get("system_id")
        user = self.request.user

        try:
            system = System.objects.get(id=system_id)
        except System.DoesNotExist:
            raise PermissionDenied("System not found.")

        is_owner = system.owner == user
        is_manager = False
        try:
            employee = Employee.objects.get(user=user, system=system)
            is_manager = employee.role in ["manager_supermarket", "inventory_manager_supermarket"]
        except Employee.DoesNotExist:
            pass

        if not (is_owner or is_manager):
            raise PermissionDenied("You do not have permission to access this system's purchase orders.")

        return (
            PurchaseOrder.objects.filter(system=system, product__isnull=False)
            .distinct()
            .order_by("-order_date")
        )

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [
                IsAuthenticated(),
                OR(IsSystemOwner(), IsEmployeeRolePermission("manager_supermarket", "inventory_manager_supermarket")),
            ]
        return [IsAuthenticated(), OR(IsSystemOwner(), IsEmployeeRolePermission("manager_supermarket", "inventory_manager_supermarket"))]

    def perform_create(self, serializer):
        system_id = self.kwargs.get("system_id")
        user = self.request.user

        try:
            system = System.objects.get(id=system_id)
        except System.DoesNotExist:
            raise PermissionDenied(
                "You do not have permission to create purchase orders in this system."
            )

        serializer.save(system=system)

    @action(detail=False, methods=["get"])
    def pending(self, request, system_id=None):
        """Get all pending purchase orders"""
        system = self._get_system_or_403(system_id)
        pending_orders = PurchaseOrder.objects.filter(
            system=system, status="pending"
        ).order_by("expected_delivery_date")
        serializer = self.get_serializer(pending_orders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def partially_received(self, request, system_id=None):
        """Get all partially received purchase orders"""
        system = self._get_system_or_403(system_id)
        partial_orders = PurchaseOrder.objects.filter(
            system=system, status="partially_received"
        ).order_by("expected_delivery_date")
        serializer = self.get_serializer(partial_orders, many=True)
        return Response(serializer.data)

    def _get_system_or_403(self, system_id):
        """Helper method to get system or raise 403"""
        try:
            return System.objects.get(id=system_id, owner=self.request.user)
        except System.DoesNotExist:
            raise PermissionDenied("You do not have permission for this system.")

    def list_sorted_by_id(self, request, system_id, *args, **kwargs):
        """
        Return a list of purchase orders sorted by ID descending.
        """
        queryset = self.filter_queryset(
            self.get_queryset().filter(system_id=system_id).order_by("-id")
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class GoodsReceivingViewSet(viewsets.ModelViewSet):
    serializer_class = GoodsReceivingSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    def get_queryset(self):
        system_id = self.kwargs.get("system_id")
        user = self.request.user

        # Allow both owner and manager_supermarket (and inventory_manager_supermarket)
        try:
            system = System.objects.get(id=system_id)
        except System.DoesNotExist:
            raise PermissionDenied("System not found.")

        is_owner = system.owner == user
        is_manager = False
        try:
            employee = Employee.objects.get(user=user, system=system)
            is_manager = employee.role in ["manager_supermarket", "inventory_manager_supermarket"]
        except Employee.DoesNotExist:
            pass

        if not (is_owner or is_manager):
            raise PermissionDenied("You do not have permission to access this system's goods receiving.")

        return (
            GoodsReceiving.objects.filter(
                purchase_order__system=system, purchase_order__product__isnull=False
            )
            .distinct()
            .order_by("-received_date")
        )

    def get_permissions(self):
        # Allow both owner and manager_supermarket for all actions
        return [
            IsAuthenticated(),
            OR(IsSystemOwner(), IsEmployeeRolePermission("manager_supermarket", "inventory_manager_supermarket")),
        ]

    def perform_create(self, serializer):
        po_id = serializer.validated_data["purchase_order"].id
        system_id = self.kwargs.get("system_id")
        user = self.request.user

        try:
            po = PurchaseOrder.objects.get(id=po_id, system_id=system_id)
            if po.system.owner != user:
                raise PermissionDenied(
                    "You do not have permission to create goods receiving for this PO."
                )
        except PurchaseOrder.DoesNotExist:
            raise PermissionDenied("Purchase Order not found.")

        serializer.save()

    @action(detail=False, methods=["get"])
    def by_purchase_order(self, request, system_id=None):
        """Get all goods receiving records for a specific purchase order"""
        po_id = request.query_params.get("purchase_order_id")
        if not po_id:
            return Response(
                {"error": "purchase_order_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        system = self._get_system_or_403(system_id)
        try:
            po = PurchaseOrder.objects.get(id=po_id, system=system)
        except PurchaseOrder.DoesNotExist:
            return Response(
                {"error": "Purchase Order not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        goods_receiving = GoodsReceiving.objects.filter(purchase_order=po)
        serializer = self.get_serializer(goods_receiving, many=True)
        return Response(serializer.data)

    def _get_system_or_403(self, system_id):
        """Helper method to get system or raise 403"""
        try:
            return System.objects.get(id=system_id, owner=self.request.user)
        except System.DoesNotExist:
            raise PermissionDenied("You do not have permission for this system.")

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
        except ValidationError as e:
            return Response(
                {"detail": e.messages[0] if hasattr(e, "messages") else str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([AllowAny])
def supermarket_public_view(request, system):
    """
    Supermarket public view. Returns available products.
    """
    products = Product.objects.filter(system=system, stock_quantity__gt=0).order_by(
        "name"
    )

    products_data = [
        {
            "id": product.id,
            "name": product.name,
            "category": product.category,
            "price": str(product.price),
            "stock_quantity": product.stock_quantity,
            "expiry_date": (
                product.expiry_date.strftime("%Y-%m-%d")
                if product.expiry_date
                else None
            ),
            "minimum_stock": product.minimum_stock,
            "barcode": product.barcode,  # Added barcode field
            "image": product.image.url if product.image else None,  # Added image field
        }
        for product in products
    ]

    return Response(
        {"system": PublicSystemSerializer(system).data, "products": products_data}
    )


@api_view(["GET"])
def supermarket_public_barcode_view(request, system, barcode):
    """
    Public endpoint to get product details by barcode.
    No authentication required.
    Uses subdomain from X-Subdomain header via middleware.
    """
    try:
        product = Product.objects.get(
            system=system, barcode=barcode, stock_quantity__gt=0
        )
        product_data = {
            "id": product.id,
            "name": product.name,
            "category": product.category,
            "price": str(product.price),
            "stock_quantity": product.stock_quantity,
            "expiry_date": (
                product.expiry_date.strftime("%Y-%m-%d")
                if product.expiry_date
                else None
            ),
            "minimum_stock": product.minimum_stock,
            "barcode": product.barcode,
            "image": product.image.url if product.image else None,
        }
        return Response(product_data)
    except Product.DoesNotExist:
        return Response(
            {"detail": "Product not found with the given barcode."},
            status=status.HTTP_404_NOT_FOUND,
        )


# Analytics Views by ali for the supermarket
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def order_summary(request, system_id):
    """Get order count summary for today, week, and month with change percentages"""
    try:
        # Get current date and calculate previous periods
        now = timezone.now()
        today = now.date()
        yesterday = today - timedelta(days=1)
        last_week_start = today - timedelta(days=7)
        last_month_start = today - timedelta(days=30)

        # Get sales for current periods
        today_sales = Sale.objects.filter(
            system_id=system_id, created_at__date=today
        ).count()

        week_sales = Sale.objects.filter(
            system_id=system_id, created_at__date__gte=last_week_start
        ).count()

        month_sales = Sale.objects.filter(
            system_id=system_id, created_at__date__gte=last_month_start
        ).count()

        # Get sales for previous periods
        yesterday_sales = Sale.objects.filter(
            system_id=system_id, created_at__date=yesterday
        ).count()

        last_week_sales = Sale.objects.filter(
            system_id=system_id,
            created_at__date__gte=last_week_start - timedelta(days=7),
            created_at__date__lt=last_week_start,
        ).count()

        last_month_sales = Sale.objects.filter(
            system_id=system_id,
            created_at__date__gte=last_month_start - timedelta(days=30),
            created_at__date__lt=last_month_start,
        ).count()

        # Calculate change percentages
        def calculate_change(current, previous):
            if previous == 0:
                return 0 if current == 0 else 100
            return ((current - previous) / previous) * 100

        day_change = calculate_change(today_sales, yesterday_sales)
        week_change = calculate_change(week_sales, last_week_sales)
        month_change = calculate_change(month_sales, last_month_sales)

        data = {
            "day_orders": today_sales,
            "day_change": round(day_change, 1),
            "week_orders": week_sales,
            "week_change": round(week_change, 1),
            "month_orders": month_sales,
            "month_change": round(month_change, 1),
        }

        serializer = OrderSummarySerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)

    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def order_trend(request, system_id):
    """Get order trend data for daily or monthly view"""
    view_type = request.GET.get("view", "daily")  # Default to daily view

    try:
        if view_type == "daily":
            # Get last 30 days of data
            start_date = timezone.now().date() - timedelta(days=30)
            sales = (
                Sale.objects.filter(
                    system_id=system_id, created_at__date__gte=start_date
                )
                .annotate(date=TruncDate("created_at"))
                .values("date")
                .annotate(orders=Count("id"))
                .order_by("date")
            )

            # Format dates and ensure all dates are included
            result = []
            current_date = start_date
            while current_date <= timezone.now().date():
                date_str = current_date.isoformat()
                day_data = next(
                    (item for item in sales if item["date"] == current_date), None
                )
                result.append(
                    {
                        "date": current_date,
                        "orders": day_data["orders"] if day_data else 0,
                    }
                )
                current_date += timedelta(days=1)

        else:  # monthly view
            # Get last 12 months of data
            start_date = timezone.now().date() - timedelta(days=365)
            sales = (
                Sale.objects.filter(
                    system_id=system_id, created_at__date__gte=start_date
                )
                .annotate(month=TruncDate("created_at"))
                .values("month")
                .annotate(orders=Count("id"))
                .order_by("month")
            )

            result = []
            current_date = start_date
            while current_date <= timezone.now().date():
                month_data = next(
                    (
                        item
                        for item in sales
                        if item["month"].strftime("%Y-%m")
                        == current_date.strftime("%Y-%m")
                    ),
                    None,
                )
                result.append(
                    {
                        "date": current_date,
                        "orders": month_data["orders"] if month_data else 0,
                    }
                )
                # Move to first day of next month
                if current_date.month == 12:
                    current_date = current_date.replace(
                        year=current_date.year + 1, month=1
                    )
                else:
                    current_date = current_date.replace(month=current_date.month + 1)

        serializer = OrderTrendSerializer(data=result, many=True)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)

    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def top_cashiers(request, system_id):
    """Get top cashiers by order count for different time ranges"""
    range_type = request.GET.get("range", "day")  # Default to daily view

    try:
        now = timezone.now()
        if range_type == "day":
            start_date = now.date()
        elif range_type == "week":
            start_date = now.date() - timedelta(days=7)
        else:  # month
            start_date = now.date() - timedelta(days=30)

        cashiers = (
            Sale.objects.filter(
                system_id=system_id,
                created_at__date__gte=start_date,
                cashier__isnull=False,
            )
            .values("cashier__user__username")
            .annotate(orders=Count("id"))
            .order_by("-orders")[:10]
        )  # Top 10 cashiers

        data = [
            {"cashier": item["cashier__user__username"], "orders": item["orders"]}
            for item in cashiers
        ]

        serializer = CashierPerformanceSerializer(data=data, many=True)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)

    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def peak_hours(request, system_id):
    """Get order count by hour for the last 7 days"""
    try:
        start_date = timezone.now().date() - timedelta(days=7)

        # Get orders grouped by hour
        hourly_orders = (
            Sale.objects.filter(system_id=system_id, created_at__date__gte=start_date)
            .annotate(hour=TruncHour("created_at"))
            .values("hour")
            .annotate(orders=Count("id"))
            .order_by("hour")
        )

        # Format the response
        data = []
        for item in hourly_orders:
            hour = item["hour"].strftime("%H:00")
            data.append({"hour": hour, "orders": item["orders"]})

        serializer = PeakHourSerializer(data=data, many=True)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)

    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def daily_profit_history(request, system_id):
    try:
        # Allow both owner and manager to access the system
        system = System.objects.get(id=system_id)
        user = request.user
        is_owner = system.owner == user
        is_manager = False
        try:
            employee = Employee.objects.get(user=user, system=system)
            is_manager = employee.role == "manager_supermarket"
        except Employee.DoesNotExist:
            pass
        if not (is_owner or is_manager):
            raise PermissionDenied("You do not have permission for this system.")
    except System.DoesNotExist:
        raise PermissionDenied("System not found.")

    # Get all sales for the system
    sales = Sale.objects.filter(system=system).order_by("created_at")

    # Group sales by date
    daily_profits = {}
    for sale in sales:
        date = sale.created_at.date()
        if date not in daily_profits:
            daily_profits[date] = {
                "total_sales": 0,
                "total_profit": 0,
                "total_discount": 0,
                "sales_count": 0,
            }

        # Calculate profit for each sale item
        for item in sale.items.all():
            if not item.product:
                continue
            if None in (item.unit_price, item.unit_cost, item.quantity, item.discount_amount, item.total_price):
                continue

            # Calculate profit using the actual unit price (which includes discounts)
            profit = (item.unit_price - item.unit_cost) * item.quantity
            discount = item.discount_amount * item.quantity

            daily_profits[date]["total_sales"] += item.total_price
            daily_profits[date]["total_profit"] += profit
            daily_profits[date]["total_discount"] += discount
            daily_profits[date]["sales_count"] += 1

    # Convert to list format
    result = [
        {
            "date": date.strftime("%Y-%m-%d"),
            "total_sales": float(data["total_sales"]),
            "total_profit": float(data["total_profit"]),
            "total_discount": float(data["total_discount"]),
            "sales_count": data["sales_count"],
        }
        for date, data in sorted(daily_profits.items())
    ]

    return Response(result)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_categories(request, system_id):
    try:
        system = System.objects.get(id=system_id)
    except System.DoesNotExist:
        raise PermissionDenied("System not found.")

    # Get default categories
    default_categories = [choice[1] for choice in Product.CATEGORY_CHOICES]

    # Get custom categories used in the system
    custom_categories = (
        Product.objects.filter(system=system)
        .exclude(category__in=default_categories)
        .values_list("category", flat=True)
        .distinct()
    )

    # Combine and return as a simple list
    all_categories = list(default_categories) + list(custom_categories)
    return Response(all_categories)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_used_categories(request, system_id):
    """Get all categories that are currently used by products"""
    try:
        system = System.objects.get(id=system_id)
    except System.DoesNotExist:
        raise PermissionDenied("System not found.")

    # Get all unique categories used by products in the system
    used_categories = (
        Product.objects.filter(system=system)
        .values_list("category", flat=True)
        .distinct()
    )

    # Return a simple list without wrapping object
    return Response(list(used_categories))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_product_by_barcode(request, system_id, barcode):
    """Get a product by its barcode"""
    try:
        system = System.objects.get(id=system_id)
    except System.DoesNotExist:
        raise PermissionDenied("System not found.")

    try:
        product = Product.objects.get(system=system, barcode=barcode)
        serializer = ProductBarcodeSerializer(product)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response(
            {"detail": "Product not found with the given barcode."},
            status=status.HTTP_404_NOT_FOUND,
        )
