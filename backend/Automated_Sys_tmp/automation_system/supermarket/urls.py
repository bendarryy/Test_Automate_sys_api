from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InventoryItemViewSet, 
    SaleViewSet,
    SupplierViewSet
)


router = DefaultRouter()
inventory_low_stock = InventoryItemViewSet.as_view({"get": "low_stock"})
inventory_item = InventoryItemViewSet.as_view(
    {
        "patch": "update_stock",
    }
)

urlpatterns = [
    path("", include(router.urls)),
    path(
        "<int:system_id>/products/",
        InventoryItemViewSet.as_view(
            {
                "get": "list",
                "post": "create",
            }
        ),
        name="inventory-list-create",
    ),
    path(
        "<int:system_id>/products/<int:pk>/",
        InventoryItemViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="inventory-detail",
    ),
    path(
        "<int:system_id>/products/low-stock/",
        inventory_low_stock,
        name="inventory-low-stock",
    ),
    path(
        "<int:system_id>/products/expiring-soon/",
        InventoryItemViewSet.as_view(
            {
                "get": "expiring_soon",
            }
        ),
        name="inventory-expiring-soon",
    ),
    path(
        "<int:system_id>/products/stock-history/",
        InventoryItemViewSet.as_view(
            {
                "get": "stock_history",
            }
        ),
        name="inventory-stock-history",
    ),
    path(
        "<int:system_id>/products/<int:pk>/stock/",
        InventoryItemViewSet.as_view(
            {
                "patch": "update_stock",
            }
        ),
        name="product-update-stock",
    ),
    path(
        "<int:system_id>/products/expired/",
        InventoryItemViewSet.as_view(
            {
                "get": "expired_products",
            }
        ),
        name="inventory-expired",
    ),
    # Sales endpoints
    path(
        "<int:system_id>/sales/",
        SaleViewSet.as_view(
            {
                "get": "list",
                "post": "create",
            }
        ),
        name="sale-list-create",
    ),
    path(
        "<int:system_id>/sales/<int:pk>/",
        SaleViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="sale-detail",
    ),
    path(
        "<int:system_id>/sales/<int:pk>/receipt/",
        SaleViewSet.as_view(
            {
                "get": "receipt",
            }
        ),
        name="sale-receipt",
    ),
    path(
        "<int:system_id>/sales/<int:pk>/apply-discount/",
        SaleViewSet.as_view(
            {
                "patch": "apply_discount",
            }
        ),
        name="sale-apply-discount",
    ),
    # Supplier endpoints
    path(
        "<int:system_id>/suppliers/",
        SupplierViewSet.as_view({
            "get": "list",
            "post": "create",
        }),
        name="supplier-list-create",
    ),
    path(
        "<int:system_id>/suppliers/<int:pk>/",
        SupplierViewSet.as_view({
            "get": "retrieve",
            "put": "update",
            "patch": "partial_update",
            "delete": "destroy",
        }),
        name="supplier-detail",
    ),
]
