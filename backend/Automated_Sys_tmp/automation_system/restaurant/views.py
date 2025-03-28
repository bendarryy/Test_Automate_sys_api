from django.forms import ValidationError
from django.shortcuts import render , get_object_or_404
from .models import *
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated 
from .models import MenuItem
from .serializers import MenuItemSerializer , OrderSerializer , OrderItemSerializer
from rest_framework.exceptions import PermissionDenied ,MethodNotAllowed


class MenuItemViewSet(viewsets.ModelViewSet):
    serializer_class = MenuItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter menu items based on the requested system_id and optional category."""
        system_id = self.kwargs.get("system_id")  
        user = self.request.user 

        system = get_object_or_404(System, id=system_id, owner=user)
        
        queryset = MenuItem.objects.filter(system=system)

        category = self.request.query_params.get("category")

        if category:
            if category in MenuItemSerializer.VALID_CATEGORIES:
                queryset = queryset.filter(category=category)

        return queryset 
    
    # def get_serializer_context(self):
    #     """Pass additional context to the serializer."""
    #     context = super().get_serializer_context()  # Get the default context
    #     context["view"] = self  # Optionally make the view accessible in the serializer
    #     return context


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter orders by the requested system."""
        system_id = self.kwargs.get("system_id")
        user = self.request.user
        system = get_object_or_404(System, id=system_id, owner=user)
        return Order.objects.filter(system=system)

    def perform_create(self, serializer):
        """Ensure the order is linked to the correct system and waiter."""
        system_id = self.kwargs.get("system_id")
        serializer.save(system_id=system_id)


class OrderItemViewSet(viewsets.ModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        system_id = self.kwargs["system_id"]
        order_id = self.kwargs["order_id"]
        user = self.request.user
        
        # Verify system ownership first
        get_object_or_404(System, id=system_id, owner=user)
        
        return OrderItem.objects.filter(
            order_id=order_id,
            menu_item__system_id=system_id
        ).select_related('menu_item')

    def perform_create(self, serializer):
        system_id = int(self.kwargs["system_id"]) 
        user = self.request.user

        # Verify system and get order in one query
        order = get_object_or_404(
            Order.objects.select_related('system'),
            id=self.kwargs["order_id"],
            system__owner=user,
            system_id=system_id
        )
        
        # 2. Get menu_item with system prefetched
        menu_item = serializer.validated_data["menu_item"]
        menu_item = MenuItem.objects.select_related('system').get(pk=menu_item.id)
        if menu_item.system_id != system_id:
            raise PermissionDenied("Menu item doesn't belong to this system")

        serializer.save(order=order)
        order.update_total_price()


    def create(self, request, *args, **kwargs):
        """Optimized bulk creation with system validation"""
        system_id = int(self.kwargs["system_id"]) 
        user = self.request.user

        # Verify system and get order in one query
        order = get_object_or_404(
            Order.objects.select_related('system'),
            id=self.kwargs["order_id"],
            system__owner=user,
            system_id=system_id
        )

        if isinstance(request.data, list):
            # Validate all items first
            serializer = self.get_serializer(data=request.data, many=True)
            serializer.is_valid(raise_exception=True)
            
            # Check all menu_items belong to system 
            for item in serializer.validated_data:
                if item['menu_item'].system_id != system_id:
                    raise PermissionDenied(
                        f"Menu item {item['menu_item'].id} doesn't belong to system"
                    )
            
            # Save all items
            items = serializer.save(order=order)
            order.update_total_price()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return super().create(request, *args, **kwargs)
    
    
    