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
            if category in MenuItemSerializer.VALID_CATEGORIES:
                queryset = queryset.filter(category=category)

        return queryset

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


#bola hy3ml push