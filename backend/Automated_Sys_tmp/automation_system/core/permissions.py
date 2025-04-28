from rest_framework.permissions import BasePermission
from .models import System , Employee

from django.shortcuts import get_object_or_404



from django.contrib.auth.models import Group

class IsEmployee(BasePermission):
    """
    Custom permission to allow only employees (in the 'Employee' group) to access a view.
    Checks if the employee is linked to the requested system.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        # Check if user is in the 'Employee' group
        try:
            employee_group = Group.objects.get(name="Employee")
            if not request.user.groups.filter(name="Employee").exists():
                return False
        except Group.DoesNotExist:
            return False

        # Check if user is an employee for the requested system
        system_id = view.kwargs.get('system_id')
        if system_id:
            try:
                system = System.objects.get(id=system_id)
                return Employee.objects.filter(
                    user=request.user,
                    system=system,
                    is_active=True
                ).exists()
            except System.DoesNotExist:
                return False

        return False

class IsWaiter(IsEmployee):
    """
    Custom permission to allow only employees with role 'waiter' to access a view.
    Inherits from IsEmployee and adds role='waiter' check.
    """
    def has_permission(self, request, view):
        # Use parent (IsEmployee) permission check
        if not super().has_permission(request, view):
            return False

        # Check if employee has role 'waiter'
        system_id = view.kwargs.get('system_id')
        try:
            system = System.objects.get(id=system_id)
            return Employee.objects.filter(
                user=request.user,
                system=system,
                role='waiter',
                is_active=True
            ).exists()
        except System.DoesNotExist:
            return False


class IsSystemOwnerOrEmployeeWithRole:
    """Custom permission to check if user is system owner or employee with specific role"""
    def has_permission(self, request, view):
        system_id = view.kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)
        user = request.user

        # Allow system owner full access
        if system.owner == user:
            return True

        # Check if user is an employee of the system
        try:
            employee = Employee.objects.get(system=system, user=user)
        except Employee.DoesNotExist:
            return False

        # Restrict actions based on role and HTTP method
        if employee.role == 'waiter':
            # Waiters can GET, POST, and partial PUT (specific fields)
            if request.method in ['GET', 'POST']:
                return True
            if request.method in ['PUT', 'PATCH']:
                # Allow updating specific fields only
                allowed_fields = {'customer_name', 'table_number', 'waiter'}
                if set(request.data.keys()).issubset(allowed_fields):
                    return True
            return False  # No DELETE or other actions
        elif employee.role in ['chef', 'delivery']:
            # Restrict chefs/delivery to GET only
            return request.method == 'GET'
        return False

    def has_object_permission(self, request, view, obj):
        system_id = view.kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id)
        user = request.user

        # Allow system owner full access
        if system.owner == user:
            return True

        # Check if user is an employee of the system
        try:
            employee = Employee.objects.get(system=system, user=user)
        except Employee.DoesNotExist:
            return False

        # Restrict actions based on role and HTTP method
        if employee.role == 'waiter':
            # Waiters can GET and partial PUT (specific fields)
            if request.method == 'GET':
                return True
            if request.method in ['PUT', 'PATCH']:
                # Allow updating specific fields only
                allowed_fields = {'customer_name', 'table_number', 'waiter'}
                if set(request.data.keys()).issubset(allowed_fields):
                    return True
            return False  # No DELETE or other actions
        elif employee.role in ['chef', 'delivery']:
            # Restrict chefs/delivery to GET only
            return request.method == 'GET'
        return False

class IsSystemOwner(BasePermission):
    """
    Custom permission to only allow the system owner to perform certain actions.
    """

    def has_permission(self, request, view):
        # Ensure the user is authenticated
        if not request.user.is_authenticated:
            return False
        
        # Extract the system ID from URL kwargs
        system_id = view.kwargs.get('system_id')
        try:
            system = System.objects.get(id=system_id)
        except System.DoesNotExist:
            return False
        
        # Check if the user is the owner of the system
        return system.owner == request.user


# class IsSystemOwner(BasePermission):
#     def has_permission(self, request, view):
#         system_id = view.kwargs.get('system_id')
#         try:
#             system = System.objects.get(id=system_id)
#             return request.user.is_authenticated and request.user == system.owner
#         except System.DoesNotExist:
#             return False