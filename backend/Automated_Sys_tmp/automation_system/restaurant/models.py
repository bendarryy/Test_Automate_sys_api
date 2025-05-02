from django.db import models
from core.models import System , BaseMultiTenantModel 
from django.contrib.auth.models import User 
from core.models import Employee



class MenuItem(BaseMultiTenantModel):
    """Menu for restaurants and cafes"""
    system = models.ForeignKey(System, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)  # Optional description
    price = models.DecimalField(max_digits=10, decimal_places=2)
    cost = models.DecimalField(max_digits=10 , decimal_places=2, default=0)
    is_available = models.BooleanField(default=True)
    category = models.CharField(max_length=50, choices=[  
        ("food", "Food"),  
        ("drink", "Drink"),  
        ("dessert", "Dessert"), 
        ("soups", "Soups") 
    ],  null=True)  # Categorize items
    image = models.ImageField(upload_to="menu_images/", blank=True, null=True)  # Optional image
    created_at = models.DateTimeField(auto_now_add=True, null=True)  # Timestamp when added
    updated_at = models.DateTimeField(auto_now=True)  # Timestamp when modified

    def __str__(self):
        return self.name
    # def __str__(self):
    #     return f"{self.name} - {self.price} {('✅' if self.is_available else '❌')}"



# The whole receipt (one per customer).

class Order(models.Model):
    system = models.ForeignKey(System, on_delete=models.CASCADE)  # Restaurant branch
    customer_name = models.CharField(max_length=100, blank=True, null=True)  # Optional customer name
    table_number = models.CharField(max_length=10, blank=True, null=True)  # Table for dine-in
    # waiter = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)  # The waiter taking the order
    waiter = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True)  # Waiter taking the order
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("preparing", "Preparing"),
        ("ready", "Ready"),
        ("completed", "Completed"),
        ("canceled", "Canceled"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def update_total_price(self):
        """Recalculate total price based on OrderItems."""
        self.total_price = sum(item.total_price() for item in self.order_items.all())
        self.save()
    
    def calculate_profit(self):
        """Calculate total profit from all order items."""
        return sum(
            (item.menu_item.price - item.menu_item.cost) * item.quantity
            for item in self.order_items.all())

    def __str__(self):
        return f"Order {self.id} - {self.customer_name or 'Table ' + self.table_number} ({self.status})"

# Each item on the receipt (multiple per order).
class OrderItem(models.Model):
    # system = models.ForeignKey(System, on_delete=models.CASCADE)  # The restaurant branch
    order = models.ForeignKey(Order, related_name="order_items", on_delete=models.CASCADE)
    menu_item = models.ForeignKey("MenuItem", on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def total_price(self):
        """Calculate total price for this order item."""
        return self.menu_item.price * self.quantity

    def __str__(self):
        return f"{self.quantity} x {self.menu_item.name} in Order {self.order.id}"




    
    
class Payment(BaseMultiTenantModel):
    system = models.ForeignKey(System, on_delete=models.CASCADE)  # Ensure payment is tied to a specific restaurant
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(
        max_length=20,
        choices=[("cash", "Cash"), ("card", "Card"), ("mobile", "Mobile Payment")],
        default="cash"
    )
    paid_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment for Order {self.order.id} - {self.amount_paid} {self.payment_method} - {self.system.name}"




class InventoryItem(models.Model):
    system = models.ForeignKey(System, on_delete=models.CASCADE, related_name='inventory_items')
    name = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=0)
    unit = models.CharField(max_length=50, blank=True, null=True)  # <-- optional
    min_threshold = models.PositiveIntegerField(blank=True, null=True)  # <-- optional
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.system.name}"

# class Staff(BaseMultiTenantModel):
#     """Each system (restaurant) has its own staff"""
#     system = models.ForeignKey(System, on_delete=models.CASCADE)
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     role = models.CharField(max_length=50, choices=[('manager', 'Manager'), ('chef', 'Chef'), ('waiter', 'Waiter')])
