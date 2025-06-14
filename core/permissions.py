from rest_framework.permissions import BasePermission
from .models import System , Employee
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import Group





class IsEmployeeWithRole(BasePermission):
    """
    Generic permission to check if user is an authenticated employee with a specific role(s).
    How to use it -> 
    
`permission_classes = [IsEmployeeRolePermission('waiter')]` OR
`permission_classes = [IsEmployeeRolePermission('waiter', 'manager')]`

    """
    def __init__(self, roles=None):
        self.roles = roles if isinstance(roles, (list, tuple)) else [roles]

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        # Ensure user is in the 'Employee' group
        if not request.user.groups.filter(name="Employee").exists():
            return False

        system_id = view.kwargs.get('system_id')
        if not system_id:
            return False

        try:
            system = System.objects.get(id=system_id)
        except System.DoesNotExist:
            return False

        # Base query
        employee_qs = Employee.objects.filter(
            user=request.user,
            system=system,
            is_active=True
        )

        # Filter by roles if specified
        if self.roles and self.roles != [None]:
            employee_qs = employee_qs.filter(role__in=self.roles)

        return employee_qs.exists()
    
def IsEmployeeRolePermission(*roles):
    class DynamicEmployeePermission(IsEmployeeWithRole):
        def __init__(self):
            super().__init__(roles)
    return DynamicEmployeePermission()



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

