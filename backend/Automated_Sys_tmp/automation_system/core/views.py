from django.shortcuts import render, redirect
from .models import Employee, System
from django.contrib.auth.decorators import login_required
from core.forms import SystemForm
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.models import User, Group, Permission
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework.decorators import api_view, permission_classes 
from rest_framework.response import Response
from rest_framework import status , generics
from rest_framework.permissions import IsAuthenticated ,AllowAny
from .serializers import SystemSerializer, UserSerializer, SystemListSerializer , ProfileSerializer
from rest_framework.generics import RetrieveAPIView, ListAPIView
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from django.core.exceptions import PermissionDenied 
from rest_framework import permissions
from rest_framework.exceptions import NotFound
from .permissions import IsSystemOwner , IsWaiter
from rest_framework.exceptions import NotFound, ValidationError
from django.contrib.auth.hashers import make_password , check_password


@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_system(request):
    serializer = SystemSerializer(data=request.data)

    if serializer.is_valid():
        system = serializer.save(owner=request.user)  # Save the instance with the owner
        return Response(
            {"message": "System created", "system_id": system.id},
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@permission_classes([IsAuthenticated])
class SystemRetrieveView(ListAPIView):
    queryset = System.objects.all()
    serializer_class = SystemListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return only the systems owned by the authenticated user."""
        return System.objects.filter(owner=self.request.user)


# @csrf_exempt
@api_view(["POST"])
def register_user(request):
    """ Exmaple of  Required data :  
    
    	{
         "username":  "user11",
	     "password": "password" ,
         "email":"user1+1@sys.com"    }
         
       Optional Data : 
 
         {
        "username": "exampleuser",
        "email": "example@example.com",
        "password": "StrongPassword123!",
        "first_name": "John",
        "last_name": "Doe"}

         """
    serializer = UserSerializer(
        data=request.data
    )  # Pass the request data to the serializer
    if serializer.is_valid():  # Validate the data
        user = serializer.save()  # This will call the create method of the serializer
        return Response(
            {"message": "User created successfully", "user_id": user.id},
            status=status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors, status=status.HTTP_400_BAD_REQUEST
    )  # Return errors if validation fails


# @csrf_exempt
@api_view(["POST"])
def login_user(request):
    """	e.g `{
	"username":  "user80",
	"password": "password"   
	}`
 Endpoints: 
 `/api/core/5/employees/`
  
 """
    data = request.data
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return Response(
            {"error": "Username and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return Response({"message": "Login successful"})
    else:
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST
        )


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def logout_user(request):
    logout(request)
    return Response({"message": "Logged out successfully"})



class ProfileView(APIView):
    """
    Retrieve the authenticated user's profile data.
    Endpoint: GET /api/core/profile/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Employee 


from .serializers import EmployeeSerializer, EmployeeCreateSerializer, EmployeeLoginSerializer ,EmployeeUpdateSerializer , EmployeeListSerializer , EmployeeInviteSerializer
from .models import Employee


class EmployeeInviteView(APIView):
    """
    System owner invites a new employee to their system `/api/core/5/invite/`
    
    Example -> `{
        "email": "help@email.com",
        "name": "helper",
        "role": "waiter",
        "phone": "0123456789",
        "password": "securepassword123"
    }`
    """
    permission_classes = [IsAuthenticated, IsSystemOwner]

    def post(self, request, system_id, *args, **kwargs):
        # Get the system
        try:
            system = System.objects.get(id=system_id)
        except System.DoesNotExist:
            raise NotFound("System not found")

        # Check if the authenticated user is the system owner
        if system.owner != request.user:
            return Response({"error": "You do not own this system."}, status=status.HTTP_403_FORBIDDEN)

        # Validate input data with system ID
        serializer = EmployeeCreateSerializer(data={**request.data, 'system': system_id})
        serializer.is_valid(raise_exception=True)

        # Create employee using serializer
        employee = serializer.save()

        # Return created employee data
        return Response({
            "employee": {
                "name": employee.name,
                "email": employee.user.email,
                "role": employee.role,
                "system": system.name,
            }
        }, status=status.HTTP_201_CREATED)


class EmployeeDetailView(APIView):
    """Handle viewing, updating, and deleting an employee for a specific system
        You can update any element   
 Example : 
 
    {
    "id": 8,
    "system": 5,
    "name": "helper",
    "role": "waiter",
    "phone": "0123456789",
    "email": "koko@email.com",
    "is_active": true}

Example :Update only passowrd/email ...  -> `{"password":"password" }` """

    permission_classes = [IsAuthenticated, IsSystemOwner]

    def get(self, request, system_id, employee_id):
        """View employee details"""
        system = self.get_system(system_id)
        employee = self.get_employee(system, employee_id)
        
        # Serialize and return the employee data
        serializer = EmployeeListSerializer(employee, context={'request': request})
        return Response(serializer.data)

    def put(self, request, system_id, employee_id):
        """Update an employee's details"""
        system = self.get_system(system_id)
        employee = self.get_employee(system, employee_id)

        # Only system owner can update employee details
        self.check_object_permissions(request, employee)

        # Use the EmployeeUpdateSerializer to update the employee data
        serializer = EmployeeUpdateSerializer(employee, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, system_id, employee_id):
        """Delete an employee and associated user"""
        system = self.get_system(system_id)
        employee = self.get_employee(system, employee_id)

        # Ensure the employee belongs to a system owned by the user
        if system.owner != request.user:
            return Response({"error": "You do not own this system."}, status=status.HTTP_403_FORBIDDEN)

        # Delete both Employee and User
        user = employee.user
        employee.delete()
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_system(self, system_id):
        """Helper method to get system object"""
        try:
            system = System.objects.get(id=system_id)
        except System.DoesNotExist:
            raise NotFound("System not found")
        return system

    def get_employee(self, system, employee_id):
        """Helper method to get employee object"""
        try:
            employee = system.employees.get(id=employee_id)
        except Employee.DoesNotExist:
            raise NotFound("Employee not found")
        return employee


class EmployeeListView(generics.ListAPIView):
    """
    Manager lists all employees of a specific system.
    """
    serializer_class = EmployeeListSerializer
    permission_classes = [IsAuthenticated, IsSystemOwner]

    def get_queryset(self):
        system_id = self.kwargs.get('system_id')
        system = get_object_or_404(System, id=system_id)
        return Employee.objects.filter(system=system)



class EmployeeLoginView(APIView):
    """
    Employee login endpoint (Session-based)
    e.g ->  `{ "email": "koko@email.com","password":"password" }`
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = EmployeeLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        # Authenticate using Django's auth system
        user = authenticate(request, username=email, password=password)
        if user is None:
            return Response({"error": "Invalid email or password."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the user is an employee
        try:
            employee = Employee.objects.get(user=user)
            if not employee.is_active:
                return Response({"error": "Employee account is not active."}, status=status.HTTP_400_BAD_REQUEST)
        except Employee.DoesNotExist:
            return Response({"error": "User is not an employee."}, status=status.HTTP_400_BAD_REQUEST)

        # Log in the user for session-based auth
        login(request, user)

        # Return employee information
        return Response({
            "employee": {
                "id": employee.id,
                "name": employee.name,
                "email": user.email,
                "role": employee.role,
                "system": employee.system.name,
            }
        }, status=status.HTTP_200_OK)
        
class EmployeeLogoutView(APIView):
    """
    Employee logout endpoint (Session-based)
 
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        logout(request)
        return Response({"success": "Successfully logged out."}, status=status.HTTP_200_OK)
