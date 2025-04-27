from django.shortcuts import render, redirect
from .models import *
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
from .serializers import SystemSerializer, UserSerializer, SystemListSerializer
from rest_framework.generics import RetrieveAPIView, ListAPIView
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from django.core.exceptions import PermissionDenied  # FIX for PermissionDenied
from django_ratelimit.decorators import ratelimit
from rest_framework import permissions


class IsSystemOwner(permissions.BasePermission):
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



# Employee 
from .serializers import EmployeeSerializer, EmployeeCreateSerializer, EmployeeLoginSerializer
from .models import Employee
from rest_framework_simplejwt.tokens import RefreshToken  # This is correct


class EmployeeInviteView(generics.CreateAPIView):
    """
    Manager (system owner) invites an employee to a specific system.
    URL example: /api/restaurant/{system_id}/invite/
    """
    
    serializer_class = EmployeeCreateSerializer
    permission_classes = [IsAuthenticated, IsSystemOwner]

    def perform_create(self, serializer):
        system_id = self.kwargs.get('system_id')
        system = get_object_or_404(System, id=system_id)
        serializer.save(system=system)



class EmployeeDeleteView(generics.DestroyAPIView):
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        system_id = self.kwargs.get('system_id')
        employee_id = self.kwargs.get('employee_id')
        system = get_object_or_404(System, id=system_id)

        if system.owner != self.request.user:
            raise PermissionDenied("You do not have permission to delete employees from this system.")

        employee = get_object_or_404(Employee, id=employee_id, system=system)
        return employee


class EmployeeListView(generics.ListAPIView):
    """
    Manager lists all employees of a specific system
    URL example: /api/restaurant/{system_id}/employees/
    """
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        system_id = self.kwargs.get('system_id')
        system = get_object_or_404(System, id=system_id)

        # Optional: check if the current user owns the system
        if system.owner != self.request.user:
            raise PermissionDenied("You do not have permission to view employees of this system.")

        return Employee.objects.filter(system=system)

class EmployeeLoginView(APIView):
    """
    Employee login endpoint
    """
    permission_classes = [AllowAny]

    @ratelimit(key='ip', rate='5/m', method='POST')
    def post(self, request, *args, **kwargs):
        serializer = EmployeeLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        try:
            employee = Employee.objects.get(email=email, is_active=True)
        except Employee.DoesNotExist:
            return Response({"error": "Invalid email or password."}, status=status.HTTP_400_BAD_REQUEST)

        if not employee.check_password(password):
            return Response({"error": "Invalid email or password."}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(employee)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "employee": EmployeeSerializer(employee).data
        }, status=status.HTTP_200_OK)


class EmployeeLogoutView(APIView):
    """
    Employee logout endpoint - blacklist the refresh token
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response({"error": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"success": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": "Invalid refresh token."}, status=status.HTTP_400_BAD_REQUEST)