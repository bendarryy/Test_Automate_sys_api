from django.forms import ValidationError
from django.shortcuts import render , get_object_or_404
from .models import *
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated 
from .models import MenuItem
from .serializers import MenuItemSerializer , OrderSerializer , OrderItemSerializer
from rest_framework.exceptions import PermissionDenied ,MethodNotAllowed
from rest_framework import permissions
from .serializers import InventoryItemSerializer
from rest_framework.exceptions import NotFound
from .models import System 
from core.models import Employee
from core.permissions import IsSystemOwner  , IsEmployeeRolePermission



from rest_framework.permissions import OR
from decimal import Decimal
from rest_framework.decorators import action, api_view
from django.http import HttpResponseNotFound
import logging

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

    @action(detail=False, methods=['get'])
    def categories(self, request, *args, **kwargs):
        """Get all categories used in this system"""
        system_id = self.kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)
        categories = MenuItem.objects.filter(system=system).values_list('category', flat=True).distinct()
        return Response(list(filter(None, categories)))  # Filter out None values

    def get_permissions(self):
        """
        Restrict create, update, and delete actions to system owners only.
        Employees can only perform list and retrieve actions.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), OR(IsSystemOwner(), IsEmployeeRolePermission('manager', "head chef"))]
        return [IsAuthenticated(), OR(IsSystemOwner(), IsEmployeeRolePermission())]




class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_queryset(self):
        """Filter orders by the requested system."""
        system_id = self.kwargs.get("system_id")
        system = get_object_or_404(System , id=system_id)
        return Order.objects.filter(system=system)

    def perform_create(self, serializer):
        """Link order to correct system."""
        system_id = self.kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)
        serializer.save(system=system)

    def perform_update(self, serializer):
        """Restrict update fields for waiters."""
        user = self.request.user
        system = get_object_or_404(System, id=self.kwargs.get("system_id"))

        if user != system.owner:
            try:
                employee = Employee.objects.get(system=system, user=user)
                if employee.role == 'waiter':
                    allowed_fields = {'customer_name', 'table_number', 'waiter'}
                    if any(field not in allowed_fields for field in self.request.data.keys()):
                        raise PermissionDenied("Waiters can only update limited fields.")
            except Employee.DoesNotExist:
                raise PermissionDenied("You do not have permission to update this order.")

        serializer.save()

    def get_permissions(self):
        """
        Role-based access control for order actions:
        - Owners, waiters, and cashiers: Full access (create, update, delete)
        - Others (chef, delivery): Read-only
        """
        editable_roles = ['waiter', 'cashier', 'manager']  # You can expand this if needed
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), OR(IsSystemOwner(), IsEmployeeRolePermission(*editable_roles))]
        # editable_roles.append()
        return [IsAuthenticated(), OR(IsSystemOwner(), IsEmployeeRolePermission(*editable_roles))]


class OrderItemViewSet(viewsets.ModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        system_id = self.kwargs["system_id"]
        order_id = self.kwargs["order_id"]
        user = self.request.user

        # Verify system ownership or employee association
        system = get_object_or_404(System, id=system_id)
        

        return OrderItem.objects.filter(
            order_id=order_id,
            menu_item__system_id=system_id
        ).select_related('menu_item')

    def perform_create(self, serializer):
        system_id = int(self.kwargs["system_id"])
        order = get_object_or_404(
            Order.objects.select_related('system'),
            id=self.kwargs["order_id"],
            system_id=system_id
        )

        # Check if the menu_item belongs to the same system
        menu_item = serializer.validated_data["menu_item"]
        menu_item = MenuItem.objects.select_related('system').get(pk=menu_item.id)
        if menu_item.system_id != system_id:
            raise PermissionDenied("Menu item doesn't belong to this system")

        serializer.save(order=order)
        order.update_total_price()

    def create(self, request, *args, **kwargs):
        """Optimized bulk creation with system validation"""
        system_id = int(self.kwargs["system_id"])
        order = get_object_or_404(
            Order.objects.select_related('system'),
            id=self.kwargs["order_id"],
            system_id=system_id
        )

        if isinstance(request.data, list):
            # Validate all items first
            serializer = self.get_serializer(data=request.data, many=True)
            serializer.is_valid(raise_exception=True)
            
            # Check if all menu_items belong to the system
            for item in serializer.validated_data:
                if item['menu_item'].system_id != system_id:
                    raise PermissionDenied(f"Menu item {item['menu_item'].id} doesn't belong to system")

            # Save all items
            items = serializer.save(order=order)
            order.update_total_price()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return super().create(request, *args, **kwargs)

    def get_permissions(self):
        """
        Role-based access control for order item actions:
        - Owners, waiters, cashiers, and managers: Can create and delete
        -         """
        editable_roles = ['waiter', 'cashier', 'manager']
        if self.action in ['create', 'destroy']:
            return [IsAuthenticated(), OR(IsSystemOwner(), IsEmployeeRolePermission(*editable_roles))]
        return [IsAuthenticated(), OR(IsSystemOwner(), IsEmployeeRolePermission(*editable_roles))]

    #add kitchen order By Ali
class KitchenOrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_permissions(self):
        """
        Only allow system owners, chefs, or managers to access this view.
        """
        if self.action in ['partial_update', 'get']:
            return [
                IsAuthenticated(),
                OR(IsSystemOwner(), IsEmployeeRolePermission('chef', 'manager'))
            ]
        return [
            IsAuthenticated(),
            OR(IsSystemOwner(), IsEmployeeRolePermission('chef', 'manager'))
        ]

    def get_queryset(self):
        system_id = self.kwargs.get('system_id')
        system = get_object_or_404(System, id=system_id)
        return Order.objects.filter(
            system=system,
            status__in=['pending', 'preparing']
        ).order_by('created_at')

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        new_status = request.data.get('status')

        if new_status not in ['preparing', 'ready']:
            return Response({"error": "Invalid status for kitchen."}, status=status.HTTP_400_BAD_REQUEST)

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
        system_id = self.kwargs.get('system_id')
        system = get_object_or_404(System, id=system_id)
        serializer.save(system=system)

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), OR(IsSystemOwner(), IsEmployeeRolePermission('manager'))]
        return [IsAuthenticated(), OR(IsSystemOwner(), IsEmployeeRolePermission('manager', 'chef'))]

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
            OR(IsSystemOwner(), IsEmployeeRolePermission('manager', 'cashier'))
        ]

    def get(self, request, system_id):
        system = get_object_or_404(System, id=system_id)
        today = date.today()

        # اليوم الحالي وأمس
        yesterday = today - timedelta(days=1)
        today_profit = self.calc_profit(system, today, today)
        yesterday_profit = self.calc_profit(system, yesterday, yesterday)
        day_change = self.percentage_change(today_profit, yesterday_profit)

        # هذا الأسبوع والأسبوع السابق
        week_start = today - timedelta(days=today.weekday())
        last_week_start = week_start - timedelta(days=7)
        last_week_end = week_start - timedelta(days=1)
        week_profit = self.calc_profit(system, week_start, today)
        last_week_profit = self.calc_profit(system, last_week_start, last_week_end)
        week_change = self.percentage_change(week_profit, last_week_profit)

        # هذا الشهر والشهر السابق
        month_start = today.replace(day=1)
        last_month_end = month_start - timedelta(days=1)
        last_month_start = last_month_end.replace(day=1)
        month_profit = self.calc_profit(system, month_start, today)
        last_month_profit = self.calc_profit(system, last_month_start, last_month_end)
        month_change = self.percentage_change(month_profit, last_month_profit)

        return Response({
            "day_profit": round(today_profit, 2),
            "day_change": day_change,
            "week_profit": round(week_profit, 2),
            "week_change": week_change,
            "month_profit": round(month_profit, 2),
            "month_change": month_change,
        })

    def calc_profit(self, system, start_date, end_date):
        orders = Order.objects.filter(
            system=system,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            status='completed'
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
            OR(IsSystemOwner(), IsEmployeeRolePermission('manager', 'cashier'))
        ]
    
    def get(self, request, system_id):
        system = get_object_or_404(System, id=system_id)
        view = request.query_params.get('view', 'daily')
        
        if view == 'daily':
            # Get last 30 days of profit data
            end_date = date.today()
            start_date = end_date - timedelta(days=29)
            
            # Get all completed orders in the date range
            orders = Order.objects.filter(
                system=system,
                created_at__date__gte=start_date,
                created_at__date__lte=end_date,
                status='completed'
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
            # Get last 12 months of profit data
            end_date = date.today()
            start_date = end_date.replace(day=1) - timedelta(days=365)
            
            # Get all completed orders in the date range
            orders = Order.objects.filter(
                system=system,
                created_at__date__gte=start_date,
                created_at__date__lte=end_date,
                status='completed'
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
            OR(IsSystemOwner(), IsEmployeeRolePermission('manager', 'cashier'))
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

        return Response({
            "today_orders": today_orders,
            "today_change": today_change,
            "week_orders": week_orders,
            "week_change": week_change,
            "month_orders": month_orders,
            "month_change": month_change,
        })

    def count_orders(self, system, start_date, end_date):
        return Order.objects.filter(
            system=system,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            status='completed'
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
            OR(IsSystemOwner(), IsEmployeeRolePermission('manager', 'cashier'))
        ]
    
    def get(self, request, system_id):
        system = get_object_or_404(System, id=system_id)
        range_param = request.query_params.get('range', 'week')
        today = date.today()
        
        # Determine date range
        if range_param == 'day':
            start_date = today
        elif range_param == 'week':
            start_date = today - timedelta(days=today.weekday())
        else:  # month
            start_date = today.replace(day=1)
        
        # Get waiter statistics
        waiter_stats = Order.objects.filter(
            system=system,
            created_at__date__gte=start_date,
            created_at__date__lte=today,
            status='completed',
            waiter__isnull=False
        ).values('waiter__user__first_name', 'waiter__user__last_name').annotate(
            orders=Count('id')
        ).order_by('-orders')
        
        # Format response
        response_data = [
            {
                "waiter": f"{stat['waiter__user__first_name']} {stat['waiter__user__last_name']}",
                "orders": stat['orders']
            }
            for stat in waiter_stats
        ]
        
        return Response(response_data)


from .serializers import PublicMenuItemSerializer

@api_view(['GET'])
def public_view(request):
    """
    Public view for accessing restaurant systems via subdomain.
    Returns menu items as JSON data.
    """
    subdomain = getattr(request, 'subdomain', None)
    
    if not subdomain:
        return Response(
            {"error": "Subdomain not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        system = System.objects.get(subdomain=subdomain)
        menu_items = MenuItem.objects.filter(
            system=system,
            is_available=True
        ).order_by('category', 'name')
        
        # Group menu items by category
        menu_by_category = {}
        for item in menu_items:
            if item.category not in menu_by_category:
                menu_by_category[item.category] = []
            menu_by_category[item.category].append(PublicMenuItemSerializer(item).data)

        return Response({
            'system': {
                'name': system.name,
                'description': system.description,
                'category': system.category
            },
            'menu': menu_by_category
        })
        
    except System.DoesNotExist:
        return Response(
            {"error": "System not found"},
            status=status.HTTP_404_NOT_FOUND
        )
