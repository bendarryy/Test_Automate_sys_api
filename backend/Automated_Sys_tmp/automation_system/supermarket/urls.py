from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InventoryItemViewSet,
    SaleViewSet,
    SupplierViewSet,
    PurchaseOrderViewSet,
    GoodsReceivingViewSet,
)
import json
from django.conf import settings


router = DefaultRouter()
inventory_low_stock = InventoryItemViewSet.as_view({"get": "low_stock"})
inventory_item = InventoryItemViewSet.as_view(
    {
        "patch": "update_stock",
    }
)

with open(settings.BASE_DIR / "core/role_actions.json") as f:
    ROLE_ACTIONS = json.load(f)

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
    path(
        "<int:system_id>/products/costs/",
        InventoryItemViewSet.as_view(
            {
                "get": "cost_analysis",
            }
        ),
        name="inventory-costs",
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
        SupplierViewSet.as_view(
            {
                "get": "list",
                "post": "create",
            }
        ),
        name="supplier-list-create",
    ),
    path(
        "<int:system_id>/suppliers/<int:pk>/",
        SupplierViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="supplier-detail",
    ),
    # Purchase Order endpoints
    path(
        "<int:system_id>/purchase-orders/",
        PurchaseOrderViewSet.as_view(
            {
                "get": "list",
                "post": "create",
            }
        ),
        name="purchase-order-list-create",
    ),
    path(
        "<int:system_id>/purchase-orders/<int:pk>/",
        PurchaseOrderViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="purchase-order-detail",
    ),
    path(
        "<int:system_id>/purchase-orders/pending/",
        PurchaseOrderViewSet.as_view(
            {
                "get": "pending",
            }
        ),
        name="purchase-order-pending",
    ),
    path(
        "<int:system_id>/purchase-orders/partially-received/",
        PurchaseOrderViewSet.as_view(
            {
                "get": "partially_received",
            }
        ),
        name="purchase-order-partially-received",
    ),
    # Goods Receiving endpoints
    path(
        "<int:system_id>/goods-receiving/",
        GoodsReceivingViewSet.as_view(
            {
                "get": "list",
                "post": "create",
            }
        ),
        name="goods-receiving-list-create",
    ),
    path(
        "<int:system_id>/goods-receiving/<int:pk>/",
        GoodsReceivingViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="goods-receiving-detail",
    ),
    path(
        "<int:system_id>/goods-receiving/by-purchase-order/",
        GoodsReceivingViewSet.as_view(
            {
                "get": "by_purchase_order",
            }
        ),
        name="goods-receiving-by-po",
    ),
]
