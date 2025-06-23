from django.forms import ValidationError
from django.shortcuts import render, get_object_or_404
from .models import *
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, OR
from .models import MenuItem
from .serializers import MenuItemSerializer, OrderSerializer, OrderItemSerializer
from rest_framework.exceptions import PermissionDenied, MethodNotAllowed, ValidationError
from rest_framework import permissions
from .serializers import InventoryItemSerializer
from rest_framework.exceptions import NotFound
from .models import System
from core.models import Employee
from core.permissions import IsSystemOwner, IsEmployeeRolePermission
from rest_framework.exceptions import APIException

from decimal import Decimal
from rest_framework.decorators import action, api_view
from django.http import HttpResponseNotFound
import logging
from core.serializers import PublicSystemSerializer 
from .serializers import RestaurantDataSerializer
import csv
from django.http import HttpResponse

# Define a custom exception for table conflicts
class TableConflict(APIException):
    status_code = 409  # Use 409 Conflict
    default_detail = 'Table is already occupied.'
    default_code = 'table_occupied'

logger = logging.getLogger(__name__)


class MenuItemViewSet(viewsets.ModelViewSet):
    serializer_class = MenuItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter menu items based on the requested system_id and optional category."""
        system_id = self.kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)
        queryset = MenuItem.objects.filter(system=system)

        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)

        return queryset

    @action(detail=False, methods=["get"])
    def categories(self, request, *args, **kwargs):
        """Get all categories used in this system"""
        system_id = self.kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)
        categories = (
            MenuItem.objects.filter(system=system)
            .values_list("category", flat=True)
            .distinct()
        )
        return Response(list(filter(None, categories)))

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [
                IsAuthenticated(),
                OR(IsSystemOwner(), IsEmployeeRolePermission("manager", "head_chef")),
            ]
        return [IsAuthenticated(), OR(IsSystemOwner(), IsEmployeeRolePermission())]

    def perform_update(self, serializer):
        """Handle image update with Cloudinary."""
        serializer.save()  # Cloudinary will handle the image storage automatically

    def list(self, request, *args, **kwargs):
        export = request.query_params.get('export')
        queryset = self.get_queryset()

        if export == 'csv':
            # Define the fields you want to export
            fieldnames = ['id', 'name', 'price', 'category', 'is_available', 'image']
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="menu_items.csv"'
            writer = csv.writer(response)
            writer.writerow(fieldnames)
            for item in queryset:
                writer.writerow([getattr(item, f) for f in fieldnames])
            return response

        return super().list(request, *args, **kwargs)

# pagination.py


from core.pagination import CustomPagination




class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    pagination_class = CustomPagination  # Add custom pagination here

    def get_queryset(self):
        """Filter orders by the requested system, ordered by most recent."""
        system_id = self.kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)
        return Order.objects.filter(system=system).order_by('-created_at')

    def perform_create(self, serializer):
        """Link order to correct system and check table availability."""
        system_id = self.kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)
        
        # Get the table number and order type from the request data
        table_number = serializer.validated_data.get('table_number')
        order_type = serializer.validated_data.get('order_type', 'in_house')
        
        # Check delivery requirements for delivery orders
        if order_type == 'delivery':
            delivery_address = serializer.validated_data.get('delivery_address')
            customer_phone = serializer.validated_data.get('customer_phone')
            
            if not delivery_address:
                raise ValidationError("Delivery address is required for delivery orders")
            if not customer_phone:
                raise ValidationError("Customer phone number is required for delivery orders")
        
        # Check table availability for in-house orders
        if order_type == 'in_house' and table_number:
            # Check if there's an active order on this table
            active_order = Order.objects.filter(
                system=system,
                table_number=table_number,
                order_type='in_house',
                status__in=['pending', 'preparing', 'ready', 'served']
            ).first()
            
            if active_order:
                raise TableConflict(detail=f"Table {table_number} is already occupied by order #{active_order.id}")
        
        # If all validations pass, save the order
        serializer.save(system=system)

    def perform_update(self, serializer):
        """Restrict update fields for waiters."""
        user = self.request.user
        system = get_object_or_404(System, id=self.kwargs.get("system_id"))

        if user != system.owner:
            try:
                employee = Employee.objects.get(system=system, user=user)
                if employee.role == "waiter":
                    allowed_fields = {"customer_name", "table_number", "waiter"}
                    if any(
                        field not in allowed_fields
                        for field in self.request.data.keys()
                    ):
                        raise PermissionDenied(
                            "Waiters can only update limited fields."
                        )
            except Employee.DoesNotExist:
                raise PermissionDenied(
                    "You do not have permission to update this order."
                )

        serializer.save()

    def get_permissions(self):
        """
        Role-based access control for order actions:
        - Owners, waiters, and cashiers: Full access (create, update, delete)
        - Others (chef, delivery): Read-only
        """
        editable_roles = [
            "waiter",
            "cashier",
            "manager",
        ]  # You can expand this if needed
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [
                IsAuthenticated(),
                OR(IsSystemOwner(), IsEmployeeRolePermission(*editable_roles)),
            ]
        # editable_roles.append()
        return [
            IsAuthenticated(),
            OR(IsSystemOwner(), IsEmployeeRolePermission(*editable_roles)),
        ]


class OrderItemViewSet(viewsets.ModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_queryset(self):
        system_id = self.kwargs["system_id"]
        order_id = self.kwargs["order_id"]
        user = self.request.user

        # Verify system ownership or employee association
        system = get_object_or_404(System, id=system_id)

        return OrderItem.objects.filter(
            order_id=order_id, menu_item__system_id=system_id
        ).select_related("menu_item")

    def perform_create(self, serializer):
        system_id = int(self.kwargs["system_id"])
        order = get_object_or_404(
            Order.objects.select_related("system"),
            id=self.kwargs["order_id"],
            system_id=system_id,
        )

        # Check if the menu_item belongs to the same system
        menu_item = serializer.validated_data["menu_item"]
        menu_item = MenuItem.objects.select_related("system").get(pk=menu_item.id)
        if menu_item.system_id != system_id:
            raise PermissionDenied("Menu item doesn't belong to this system")

        serializer.save(order=order)
        order.update_total_price()

    def create(self, request, *args, **kwargs):
        """Optimized bulk creation with system validation"""
        system_id = int(self.kwargs["system_id"])
        order = get_object_or_404(
            Order.objects.select_related("system"),
            id=self.kwargs["order_id"],
            system_id=system_id,
        )

        if isinstance(request.data, list):
            # Validate all items first
            serializer = self.get_serializer(data=request.data, many=True)
            serializer.is_valid(raise_exception=True)

            # Check if all menu_items belong to the system
            for item in serializer.validated_data:
                if item["menu_item"].system_id != system_id:
                    raise PermissionDenied(
                        f"Menu item {item['menu_item'].id} doesn't belong to system"
                    )

            # Save all items
            items = serializer.save(order=order)
            order.update_total_price()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return super().create(request, *args, **kwargs)

    def get_permissions(self):
        """
        Role-based access control for order item actions:
        - Owners, waiters, cashiers, and managers: Can create and delete
        -"""
        editable_roles = ["waiter", "cashier", "manager"]
        if self.action in ["create", "destroy"]:
            return [
                IsAuthenticated(),
                OR(IsSystemOwner(), IsEmployeeRolePermission(*editable_roles)),
            ]
        return [
            IsAuthenticated(),
            OR(IsSystemOwner(), IsEmployeeRolePermission(*editable_roles)),
        ]

    # add kitchen order By Ali


class KitchenOrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]

    def get_permissions(self):
        """
        Only allow system owners, chefs, or managers to access this view.
        """
        if self.action in ["partial_update", "get"]:
            return [
                IsAuthenticated(),
                OR(IsSystemOwner(), IsEmployeeRolePermission("chef", "manager", "head_chef")),
            ]
        return [
            IsAuthenticated(),
            OR(IsSystemOwner(), IsEmployeeRolePermission("chef", "manager", "head_chef")),
        ]

    def get_queryset(self):
        system_id = self.kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)
        return Order.objects.filter(
            system=system, status__in=["pending", "preparing"]
        ).order_by("created_at")

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        new_status = request.data.get("status")

        if new_status not in ["preparing", "ready"]:
            return Response(
                {"error": "Invalid status for kitchen."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance.status = new_status
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)


class InventoryItemViewSet(viewsets.ModelViewSet):
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        system_id = self.kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)

        return InventoryItem.objects.filter(system=system)

    def perform_create(self, serializer):
        system_id = self.kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)
        serializer.save(system=system)

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [
                IsAuthenticated(),
                OR(IsSystemOwner(), IsEmployeeRolePermission("manager", "inventory_manager")),
            ]
        return [
            IsAuthenticated(),
            OR(IsSystemOwner(), IsEmployeeRolePermission("manager", "chef" , "inventory_manager" , "head_chef")), 
        ]


# Finances Dashboard & Visualizations
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Sum, F, ExpressionWrapper, DecimalField
from datetime import date, timedelta
from django.utils.timezone import now
from collections import defaultdict
from .models import Order, OrderItem, MenuItem
from rest_framework.permissions import IsAuthenticated, OR
from core.permissions import IsSystemOwner, IsEmployeeRolePermission


class ProfitSummaryView(APIView):
    def get_permissions(self):
        return [
            IsAuthenticated(),
            OR(IsSystemOwner(), IsEmployeeRolePermission("manager")),
        ]

    def get(self, request, system_id):
        system = get_object_or_404(System, id=system_id)
        today = date.today()
        system_created_date = system.created_at.date()

        # If system was created today, only return today's data
        if system_created_date == today:
            today_profit = self.calc_profit(system, today, today)
            return Response({
                "day_profit": round(today_profit, 2),
                "day_change": 0.0,  # No change since it's the first day
                "week_profit": round(today_profit, 2),
                "week_change": 0.0,  # No change since it's the first week
                "month_profit": round(today_profit, 2),
                "month_change": 0.0,  # No change since it's the first month
            })

        # Calculate yesterday's data only if system existed yesterday
        yesterday = today - timedelta(days=1)
        today_profit = self.calc_profit(system, today, today)
        if yesterday >= system_created_date:
            yesterday_profit = self.calc_profit(system, yesterday, yesterday)
            day_change = self.percentage_change(today_profit, yesterday_profit)
        else:
            yesterday_profit = 0
            day_change = 100.0 if today_profit > 0 else 0.0

        # Calculate week's data
        week_start = today - timedelta(days=today.weekday())
        if week_start < system_created_date:
            week_start = system_created_date
        last_week_start = week_start - timedelta(days=7)
        last_week_end = week_start - timedelta(days=1)
        
        week_profit = self.calc_profit(system, week_start, today)
        if last_week_start >= system_created_date:
            last_week_profit = self.calc_profit(system, last_week_start, last_week_end)
            week_change = self.percentage_change(week_profit, last_week_profit)
        else:
            last_week_profit = 0
            week_change = 100.0 if week_profit > 0 else 0.0

        # Calculate month's data
        month_start = today.replace(day=1)
        if month_start < system_created_date:
            month_start = system_created_date
        last_month_end = month_start - timedelta(days=1)
        last_month_start = last_month_end.replace(day=1)
        
        month_profit = self.calc_profit(system, month_start, today)
        if last_month_start >= system_created_date:
            last_month_profit = self.calc_profit(system, last_month_start, last_month_end)
            month_change = self.percentage_change(month_profit, last_month_profit)
        else:
            last_month_profit = 0
            month_change = 100.0 if month_profit > 0 else 0.0

        return Response(
            {
                "day_profit": round(today_profit, 2),
                "day_change": day_change,
                "week_profit": round(week_profit, 2),
                "week_change": week_change,
                "month_profit": round(month_profit, 2),
                "month_change": month_change,
            }
        )

    def calc_profit(self, system, start_date, end_date):
        orders = Order.objects.filter(
            system=system,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            status="completed",
        )
        return sum(order.calculate_profit() for order in orders)

    def percentage_change(self, current, previous):
        if previous == 0:
            if current == 0:
                return 0.0
            return 100.0
        return round(((current - previous) / previous) * 100, 2)


class ProfitTrendView(APIView):
    def get_permissions(self):
        return [
            IsAuthenticated(),
            OR(IsSystemOwner(), IsEmployeeRolePermission("manager", )),
        ]

    def get(self, request, system_id):
        system = get_object_or_404(System, id=system_id)
        view = request.query_params.get("view", "daily")
        system_created_date = system.created_at.date()

        if view == "daily":
            # Get last 30 days of profit data, but not before system creation
            end_date = date.today()
            start_date = max(end_date - timedelta(days=29), system_created_date)

            # Get all completed orders in the date range
            orders = Order.objects.filter(
                system=system,
                created_at__date__gte=start_date,
                created_at__date__lte=end_date,
                status="completed",
            )

            # Group by date and calculate profit
            daily_profits = defaultdict(Decimal)
            for order in orders:
                order_date = order.created_at.date()
                daily_profits[order_date] += order.calculate_profit()

            # Format response
            response_data = [
                {"date": str(date), "profit": float(round(profit, 2))}
                for date, profit in sorted(daily_profits.items())
            ]

        else:  # monthly view
            # Get last 12 months of profit data, but not before system creation
            end_date = date.today()
            start_date = max(end_date.replace(day=1) - timedelta(days=365), system_created_date)

            # Get all completed orders in the date range
            orders = Order.objects.filter(
                system=system,
                created_at__date__gte=start_date,
                created_at__date__lte=end_date,
                status="completed",
            )

            # Group by month and calculate profit
            monthly_profits = defaultdict(Decimal)
            for order in orders:
                month_key = order.created_at.date().replace(day=1)
                monthly_profits[month_key] += order.calculate_profit()

            # Format response
            response_data = [
                {"date": str(date), "profit": float(round(profit, 2))}
                for date, profit in sorted(monthly_profits.items())
            ]

        return Response(response_data)


class OrderSummaryView(APIView):
    def get_permissions(self):
        return [
            IsAuthenticated(),
            OR(IsSystemOwner(), IsEmployeeRolePermission("manager", )),
        ]

    def get(self, request, system_id):
        system = get_object_or_404(System, id=system_id)
        today = date.today()

        # اليوم الحالي وأمس
        yesterday = today - timedelta(days=1)
        today_orders = self.count_orders(system, today, today)
        yesterday_orders = self.count_orders(system, yesterday, yesterday)
        today_change = self.percentage_change(today_orders, yesterday_orders)

        # هذا الأسبوع والأسبوع السابق
        week_start = today - timedelta(days=today.weekday())
        last_week_start = week_start - timedelta(days=7)
        last_week_end = week_start - timedelta(days=1)
        week_orders = self.count_orders(system, week_start, today)
        last_week_orders = self.count_orders(system, last_week_start, last_week_end)
        week_change = self.percentage_change(week_orders, last_week_orders)

        # هذا الشهر والشهر السابق
        month_start = today.replace(day=1)
        last_month_end = month_start - timedelta(days=1)
        last_month_start = last_month_end.replace(day=1)
        month_orders = self.count_orders(system, month_start, today)
        last_month_orders = self.count_orders(system, last_month_start, last_month_end)
        month_change = self.percentage_change(month_orders, last_month_orders)

        return Response(
            {
                "today_orders": today_orders,
                "today_change": today_change,
                "week_orders": week_orders,
                "week_change": week_change,
                "month_orders": month_orders,
                "month_change": month_change,
            }
        )

    def count_orders(self, system, start_date, end_date):
        return Order.objects.filter(
            system=system,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            status="completed",
        ).count()

    def percentage_change(self, current, previous):
        if previous == 0:
            if current == 0:
                return 0.0
            return 100.0
        return round(((current - previous) / previous) * 100, 2)


class WaiterStatsView(APIView):
    def get_permissions(self):
        return [
            IsAuthenticated(),
            OR(IsSystemOwner(), IsEmployeeRolePermission("manager")),
        ]

    def get(self, request, system_id):
        system = get_object_or_404(System, id=system_id)
        range_param = request.query_params.get("range", "week")
        today = date.today()

        # Determine date range
        if range_param == "day":
            start_date = today
        elif range_param == "week":
            start_date = today - timedelta(days=today.weekday())
        else:  # month
            start_date = today.replace(day=1)

        # Get waiter statistics
        waiter_stats = (
            Order.objects.filter(
                system=system,
                created_at__date__gte=start_date,
                created_at__date__lte=today,
                status="completed",
                waiter__isnull=False,
            )
            .values("waiter__user__first_name", "waiter__user__last_name")
            .annotate(orders=Count("id"))
            .order_by("-orders")
        )

        # Format response
        response_data = [
            {
                "waiter": f"{stat['waiter__user__first_name']} {stat['waiter__user__last_name']}",
                "orders": stat["orders"],
            }
            for stat in waiter_stats
        ]

        return Response(response_data)


from .serializers import PublicMenuItemSerializer
@api_view(['GET'])
def restaurant_public_view(request, system):
    """
    Restaurant public view. Returns menu grouped by category.
    """
    menu_items = MenuItem.objects.filter(
        system=system,
        is_available=True
    ).order_by('category', 'name')

    menu_by_category = {}
    for item in menu_items:
        category = item.category or "Uncategorized"
        if category not in menu_by_category:
            menu_by_category[category] = []
        menu_by_category[category].append(PublicMenuItemSerializer(item).data)

    return Response({
        'system': PublicSystemSerializer(system).data,
        'menu': menu_by_category
    })


# waiter display By Ali
class WaiterDisplayViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]

    def get_permissions(self):
        """
        Access control for Waiter Display System:
        - Owner, Waiter, Manager: Full access
        - Others: Read-only access
        """
        editable_roles = ["waiter", "manager"]
        if self.action in ["partial_update"]:
            return [
                IsAuthenticated(),
                OR(IsSystemOwner(), IsEmployeeRolePermission(*editable_roles)),
            ]
        return [IsAuthenticated(), OR(IsSystemOwner(), IsEmployeeRolePermission(*editable_roles))]

    def get_queryset(self):
        """Filter orders by system and ready/served status"""
        system_id = self.kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)
        return Order.objects.filter(
            system=system,
            order_type="in_house",
            status__in=["ready", "served"]
        ).select_related("waiter").prefetch_related("order_items__menu_item")

    @action(detail=False, methods=["get"])
    def tables(self, request, *args, **kwargs):
        """Get status of all tables"""
        system_id = self.kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)
        
        # Get all ready and served in-house orders
        active_orders = Order.objects.filter(
            system=system,
            order_type="in_house",
            status__in=["ready", "served"]
        ).select_related("waiter")

        # Create a dictionary of table statuses
        table_status = {}
        for order in active_orders:
            if order.table_number:
                table_status[order.table_number] = {
                    "status": order.status,
                    "current_order": {
                        "id": order.id,
                        "customer_name": order.customer_name,
                        "status": order.status
                    }
                }

        return Response(table_status)

    def partial_update(self, request, *args, **kwargs):
        """Update order status with validation"""
        instance = self.get_object()
        new_status = request.data.get("status")

        if not new_status:
            return Response(
                {"error": "Status is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate status transition for in-house orders
        valid_statuses = ["pending", "preparing", "ready", "served", "completed", "canceled"]
        if new_status not in valid_statuses:
            return Response(
                {"error": "Invalid status for in-house order"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

# delivery By Ali
class DeliveryViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]

    def get_permissions(self):
        """
        Access control for Delivery System:
        - Owner, Delivery Driver, Manager: Full access
        - Others: Read-only access
        """
        editable_roles = ["delivery_driver", "manager"]
        if self.action in ["partial_update"]:
            return [
                IsAuthenticated(),
                OR(IsSystemOwner(), IsEmployeeRolePermission(*editable_roles)),
            ]
        editable_roles = ["delivery_driver", "manager"]
        return [IsAuthenticated(), OR(IsSystemOwner(), IsEmployeeRolePermission(*editable_roles))]

    def get_queryset(self):
        """Filter delivery orders by system and ready/out_for_delivery status"""
        system_id = self.kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)
        return Order.objects.filter(
            system=system,
            order_type="delivery",
            status__in=["ready", "out_for_delivery"]
        ).select_related("waiter").prefetch_related("order_items__menu_item")

    def partial_update(self, request, *args, **kwargs):
        """Update delivery order status with validation"""
        instance = self.get_object()
        new_status = request.data.get("status")

        if not new_status:
            return Response(
                {"error": "Status is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        valid_statuses = ["pending", "preparing", "ready", "out_for_delivery", "completed", "canceled"]
        if new_status not in valid_statuses:
            return Response(
                {"error": "Invalid status for delivery order"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def active(self, request, *args, **kwargs):
        """Get all ready and out_for_delivery orders"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def completed(self, request, *args, **kwargs):
        """Get all completed delivery orders"""
        system_id = self.kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)
        queryset = Order.objects.filter(
            system=system,
            order_type="delivery",
            status="completed"
        ).select_related("waiter").prefetch_related("order_items__menu_item")
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def canceled(self, request, *args, **kwargs):
        """Get all canceled delivery orders"""
        system_id = self.kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)
        queryset = Order.objects.filter(
            system=system,
            order_type="delivery",
            status="canceled"
        ).select_related("waiter").prefetch_related("order_items__menu_item")
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class TableViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        editable_roles = ["waiter", "cashier", "manager"]
        return [
            IsAuthenticated(),
            OR(IsSystemOwner(), IsEmployeeRolePermission(*editable_roles)),
        ]

    def list(self, request, system_id=None):
        """Get all tables and their active orders"""
        system = get_object_or_404(System, id=system_id)
        
        # Get restaurant data to determine number of tables
        restaurant_data = get_object_or_404(RestaurantData, system=system)
        total_tables = restaurant_data.number_of_tables
        
        # Get all orders that are in-house and not completed/canceled
        active_orders = Order.objects.filter(
            system=system,
            order_type="in_house",
            status__in=["pending", "preparing", "ready", "served"]
        ).exclude(table_number__isnull=True).exclude(table_number="")

        # Create a dictionary to store table status
        tables_status = {}
        
        # Get all unique table numbers from active orders
        for order in active_orders:
            table_number = order.table_number
            if table_number not in tables_status:
                tables_status[table_number] = {
                    "table_number": table_number,
                    "is_occupied": True,
                    "current_order": {
                        "order_id": order.id,
                        "status": order.status,
                        "customer_name": order.customer_name,
                        "waiter": order.waiter.user.username if order.waiter else None,
                        "created_at": order.created_at
                    }
                }

        # Add empty tables (tables with no active orders)
        for table_num in range(1, total_tables + 1):  # Use the number from RestaurantData
            table_str = str(table_num)
            if table_str not in tables_status:
                tables_status[table_str] = {
                    "table_number": table_str,
                    "is_occupied": False,
                    "current_order": None
                }

        return Response(list(tables_status.values()))

    @action(detail=False, methods=['get'])
    def occupied_tables(self, request, system_id=None):
        """Get only occupied tables and their active orders"""
        system = get_object_or_404(System, id=system_id)
        
        # Get all orders that are in-house and not completed/canceled
        active_orders = Order.objects.filter(
            system=system,
            order_type="in_house",
            status__in=["pending", "preparing", "ready", "served"]
        ).exclude(table_number__isnull=True).exclude(table_number="")

        # Create a list to store occupied table status
        occupied_tables_status = []
        
        # Get all unique table numbers from active orders
        for order in active_orders:
            table_number = order.table_number
            occupied_tables_status.append({
                "table_number": table_number,
                "is_occupied": True,
                "current_order": {
                    "order_id": order.id,
                    "status": order.status,
                    "customer_name": order.customer_name,
                    "waiter": order.waiter.user.username if order.waiter else None,
                    "created_at": order.created_at
                }
            })

        return Response(occupied_tables_status)


class RestaurantDataAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        editable_roles = ["manager"]
        return [
            IsAuthenticated(),
            OR(IsSystemOwner(), IsEmployeeRolePermission(*editable_roles)),
        ]

    def get(self, request, system_id):
        """Get restaurant data including number of tables"""
        restaurant_data = get_object_or_404(RestaurantData, system_id=system_id)
        serializer = RestaurantDataSerializer(restaurant_data)
        return Response(serializer.data)

    def post(self, request, system_id):
        """Set the number of tables for the restaurant"""
        restaurant_data = get_object_or_404(RestaurantData, system_id=system_id)
        number_of_tables = request.data.get('number_of_tables')

        if not number_of_tables or not isinstance(number_of_tables, int) or number_of_tables < 1:
            return Response(
                {'error': 'Please provide a valid positive number of tables'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        restaurant_data.number_of_tables = number_of_tables
        restaurant_data.save()
        serializer = RestaurantDataSerializer(restaurant_data)
        return Response(serializer.data)

