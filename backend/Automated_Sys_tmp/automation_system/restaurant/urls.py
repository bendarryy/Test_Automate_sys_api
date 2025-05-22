from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()

# Register existing MenuItem routes
router.register(r'(?P<system_id>\d+)/menu-items', MenuItemViewSet, basename="menu-items")
# Register new Order routes
router.register(r"(?P<system_id>\d+)/orders", OrderViewSet, basename="order")
-router.register(r"(?P<system_id>\d+)/orders/(?P<order_id>\d+)/items", OrderItemViewSet, basename="order-item")
router.register(r'(?P<system_id>\d+)/kitchen/orders', KitchenOrderViewSet, basename='kitchen-orders')
# Register Waiter Display System routes
router.register(r'(?P<system_id>\d+)/waiter/orders', WaiterDisplayViewSet, basename='waiter-orders')
# Register Delivery System routes
router.register(r'(?P<system_id>\d+)/delivery/orders', DeliveryViewSet, basename='delivery-orders')

# API URLs
api_urlpatterns = [
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
    path('<int:system_id>/orders/analytics/profit-summary/', ProfitSummaryView.as_view(), name='profit-summary'),
    path('<int:system_id>/orders/analytics/profit-trend/', ProfitTrendView.as_view(), name='profit-trend'),
    path('<int:system_id>/orders/analytics/order-summary/', OrderSummaryView.as_view(), name='order-summary'),
    #path('<int:system_id>/orders/analytics/waiters/', WaiterStatsView.as_view(), name='waiter-stats'),
]
# Public URLs - these will be handled by the subdomain middleware
public_urlpatterns = [
    path('menu/', public_view, name='public-view'),  # Changed from '' to 'menu/'
]

# Combine both URL patterns
urlpatterns = api_urlpatterns + public_urlpatterns

