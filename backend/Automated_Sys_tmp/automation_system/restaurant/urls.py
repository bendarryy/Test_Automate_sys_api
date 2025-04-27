from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()

# Register existing MenuItem routes
router.register(r'(?P<system_id>\d+)/menu-items', MenuItemViewSet, basename="menu-items")
# Register new Order routes
router.register(r"(?P<system_id>\d+)/orders", OrderViewSet, basename="order")
router.register(r"(?P<system_id>\d+)/orders/(?P<order_id>\d+)/items", OrderItemViewSet, basename="order-item")
router.register(r'kitchen/orders', KitchenOrderViewSet, basename='kitchen-orders')
urlpatterns = [
    path('', include(router.urls)),
    path('<int:system_id>/inventory/', InventoryItemViewSet.as_view({
        'get': 'list',
        'post': 'create',
    }), name='inventory-list-create'),
    
    path('<int:system_id>/inventory/<int:pk>/', InventoryItemViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy',
    }), name='inventory-detail'),
]

