import os
import sys
import django

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Automated_Sys_tmp.settings')
django.setup()

from django.db import transaction
from automation_system.supermarket.models import Product, SaleItem, PurchaseOrder

def delete_products_and_related_data(product_ids):
    try:
        with transaction.atomic():
            # 1. Delete related SaleItems
            sale_items_count = SaleItem.objects.filter(product_id__in=product_ids).count()
            SaleItem.objects.filter(product_id__in=product_ids).delete()
            print(f"Deleted {sale_items_count} sale items")

            # 2. Delete related PurchaseOrders
            purchase_orders_count = PurchaseOrder.objects.filter(product_id__in=product_ids).count()
            PurchaseOrder.objects.filter(product_id__in=product_ids).delete()
            print(f"Deleted {purchase_orders_count} purchase orders")

            # 3. Delete the products
            products_count = Product.objects.filter(id__in=product_ids).count()
            Product.objects.filter(id__in=product_ids).delete()
            print(f"Deleted {products_count} products")

        print(f'Successfully deleted products {product_ids} and all related data')
    except Exception as e:
        print(f'Error deleting products: {str(e)}')

if __name__ == '__main__':
    # Delete products with IDs 2 and 3
    delete_products_and_related_data([2, 3])
