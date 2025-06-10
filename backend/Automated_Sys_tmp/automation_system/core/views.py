from django.shortcuts import render, redirect
from .models import Employee, System, PublicSliderImage, OpeningHours
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
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import (
    UserSerializer, 
    SystemListSerializer, 
    ProfileSerializer, 
    SystemCreateSerializer, 
    SystemUpdateSerializer,
    EmployeeSerializer, 
    EmployeeCreateSerializer, 
    EmployeeLoginSerializer,
    EmployeeUpdateSerializer, 
    EmployeeListSerializer, 
    EmployeeInviteSerializer,
    SystemDeleteSerializer,
    ProfileUpdateSerializer,
    BaseSystemSerializer,
    SystemSerializer,
    PublicSliderImageSerializer,
    OpeningHoursSerializer
)
from rest_framework.generics import RetrieveAPIView, ListAPIView
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from django.core.exceptions import PermissionDenied 
from rest_framework import permissions
from rest_framework.exceptions import NotFound
from .permissions import IsSystemOwner
from rest_framework.exceptions import NotFound, ValidationError
from django.contrib.auth.hashers import make_password, check_password
from drf_yasg.utils import swagger_auto_schema
from django.conf import settings
from drf_yasg import openapi
from rest_framework import serializers
from rest_framework import viewsets

@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_system(request):
    serializer = BaseSystemSerializer(data=request.data)

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
    # serializer_class = SystemListSerializer
    serializer_class = BaseSystemSerializer
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
            {"error": "Invalid Username or Password"}, 
            status=status.HTTP_401_UNAUTHORIZED
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
        # Determine role
        role = serializer.data.get('role')
        # Load actions from JSON file
        try:
            with open(settings.BASE_DIR / 'core/role_actions.json') as f:
                ROLE_ACTIONS = json.load(f)
        except Exception:
            ROLE_ACTIONS = {}
        actions = ROLE_ACTIONS.get(role, [])
        # Compose response
        return Response({
            "user": serializer.data.get('user'),
            "role": role,
            "systems": serializer.data.get('systems'),
            "actions": actions
        }, status=status.HTTP_200_OK)
# change password by ali
class ChangePasswordView(APIView):
    """
    Change user password endpoint.
    Requires authentication and old password verification.
    
    Example request body:
    {
        "old_password": "currentpassword",
        "new_password": "newsecurepassword"
    }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response(
                {"error": "Both old_password and new_password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify old password
        if not check_password(old_password, request.user.password):
            return Response(
                {"error": "Old password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate new password (you can add more validation rules here)
        if len(new_password) < 8:
            return Response(
                {"error": "New password must be at least 8 characters long"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update password
        request.user.password = make_password(new_password)
        request.user.save()

        return Response(
            {"message": "Password changed successfully"},
            status=status.HTTP_200_OK
        )

# Employee 


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
    @swagger_auto_schema(request_body=EmployeeCreateSerializer)
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

    @swagger_auto_schema(
        request_body=EmployeeUpdateSerializer,
        responses={200: EmployeeUpdateSerializer})
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

    @swagger_auto_schema(request_body=EmployeeLoginSerializer)
    def post(self, request, *args, **kwargs):
        try:
            serializer = EmployeeLoginSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            # Authenticate using Django's auth system
            user = authenticate(request, username=email, password=password)
            if user is None:
                return Response(
                    {"error": "Invalid email or password."}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Check if the user is an employee
            try:
                employee = Employee.objects.get(user=user)
                if not employee.is_active:
                    return Response(
                        {"error": "Invalid email or password."}, 
                        status=status.HTTP_401_UNAUTHORIZED
                    )
            except Employee.DoesNotExist:
                return Response(
                    {"error": "Invalid email or password."}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )

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
            
        except serializers.ValidationError:
            return Response(
                {"error": "Invalid email or password."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return Response(
                {"error": "Invalid email or password."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
class EmployeeLogoutView(APIView):
    """
    Employee logout endpoint (Session-based)
 
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        logout(request)
        return Response({"success": "Successfully logged out."}, status=status.HTTP_200_OK)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsSystemOwner])
def update_system_subdomain(request, system_id):
    """
    Update the subdomain of a system.
    Only the system owner can update the subdomain.
    """
    system = get_object_or_404(System, id=system_id)
    
    # Check if the user is the owner
    if system.owner != request.user:
        return Response(
            {"error": "Only the system owner can update the subdomain"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    new_subdomain = request.data.get('subdomain')
    if not new_subdomain:
        return Response(
            {"error": "Subdomain is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if subdomain is already taken
    if System.objects.filter(subdomain=new_subdomain).exclude(id=system_id).exists():
        return Response(
            {"error": "This subdomain is already taken"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Update the subdomain
    system.subdomain = new_subdomain
    system.save()
    
    return Response({
        "message": "Subdomain updated successfully",
        "subdomain": system.subdomain
    })

class BaseSystemView(APIView):
    """Base view for system operations with common functionality"""
    
    def get_system_response(self, system):
        """Generate standard system response data"""
        return {
            "id": system.id,
            "uuid": system.uuid,
            "name": system.name,
            "category": system.category,
            "description": system.description,
            "subdomain": system.subdomain,
            "custom_domain": system.custom_domain,
            "is_public": system.is_public,
            "is_active": system.is_active,
            "created_at": system.created_at,
            "updated_at": system.updated_at,
            "url": f"https://{system.subdomain}.yourdomain.com" if system.subdomain else None
        }

class SystemCreateView(BaseSystemView):
    """Create a new system"""
    permission_classes = [IsAuthenticated]
    serializer_class = SystemCreateSerializer

    @swagger_auto_schema(
        request_body=SystemCreateSerializer,
        responses={
            201: openapi.Response(
                description="System created successfully",
                schema=SystemCreateSerializer
            ),
            400: "Bad Request - Invalid data",
            401: "Unauthorized - Authentication required"
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            try:
                system = serializer.save(
                    owner=request.user,
                    is_active=True
                )
                return Response({
                    "message": "System created successfully",
                    "system": self.get_system_response(system)
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SystemUpdateView(BaseSystemView):
    """Update an existing system"""
    permission_classes = [IsAuthenticated, IsSystemOwner]
    serializer_class = SystemUpdateSerializer

    @swagger_auto_schema(
        request_body=SystemUpdateSerializer,
        responses={
            200: openapi.Response(
                description="System updated successfully",
                schema=SystemUpdateSerializer
            ),
            400: "Bad Request - Invalid data or incorrect password",
            401: "Unauthorized - Authentication required",
            403: "Forbidden - Not the system owner",
            404: "Not Found - System not found"
        }
    )
    def patch(self, request, system_id, *args, **kwargs):
        try:
            system = System.objects.get(id=system_id)
        except System.DoesNotExist:
            return Response(
                {"error": "System not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if system.owner != request.user:
            return Response(
                {"error": "You do not have permission to update this system"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.serializer_class(
            system, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            try:
                # Remove password from data before saving
                validated_data = serializer.validated_data
                validated_data.pop('password', None)
                
                updated_system = serializer.save()
                return Response({
                    "message": "System updated successfully",
                    "system": self.get_system_response(updated_system)
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SystemDeleteView(APIView):
    """Delete a system with password confirmation"""
    permission_classes = [IsAuthenticated, IsSystemOwner]
    serializer_class = SystemDeleteSerializer

    @swagger_auto_schema(
        request_body=SystemDeleteSerializer,
        responses={
            200: "System deleted successfully",
            400: "Bad Request - Invalid data or incorrect password",
            401: "Unauthorized - Authentication required",
            403: "Forbidden - Not the system owner",
            404: "Not Found - System not found"
        }
    )
    def delete(self, request, system_id, *args, **kwargs):
        try:
            system = System.objects.get(id=system_id)
        except System.DoesNotExist:
            return Response(
                {"error": "System not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if system.owner != request.user:
            return Response(
                {"error": "You do not have permission to delete this system"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.serializer_class(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            try:
                # Delete the system
                system.delete()
                return Response(
                    {"message": "System deleted successfully"},
                    status=status.HTTP_200_OK
                )
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# ubdate profile by ali
class ProfileUpdateView(APIView):
    """
    Update user profile information with password verification.
    Endpoint: PATCH /api/core/profile/update/
    
    Example request body:
    {
        "current_password": "your_current_password",
        "username": "new_username",  # optional
        "email": "new_email@example.com",  # optional
        "first_name": "New First Name",  # optional
        "last_name": "New Last Name",  # optional
        "phone": "1234567890"  # optional
    }
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileUpdateSerializer

    @swagger_auto_schema(
        request_body=ProfileUpdateSerializer,
        responses={
            200: ProfileSerializer,
            400: "Bad Request - Invalid data or incorrect password",
            401: "Unauthorized - Authentication required"
        }
    )
    def patch(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            request.user,
            data=request.data,
            context={'request': request},
            partial=True
        )
        
        if serializer.is_valid():
            updated_user = serializer.save()
            # Return updated profile data
            profile_serializer = ProfileSerializer(updated_user)
            return Response(profile_serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CheckAuthView(APIView):
    """
    Lightweight endpoint to check authentication status
    Returns minimal data for quick checks
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response({
            "is_authenticated": True,
            "user_id": request.user.id
        }, status=status.HTTP_200_OK)

class PublicProfileViewSet(viewsets.ModelViewSet):
    """Handle public profile operations"""
    permission_classes = [IsAuthenticated, IsSystemOwner]
    serializer_class = SystemSerializer
    lookup_field = 'system_id'
    lookup_url_kwarg = 'system_id'

    def get_queryset(self):
        return System.objects.filter(owner=self.request.user)

    def get_object(self):
        system_id = self.kwargs.get('system_id')
        return get_object_or_404(
            System,
            id=system_id,
            owner=self.request.user
        )   

class PublicSliderImageViewSet(viewsets.ModelViewSet):
    """Handle slider image operations"""
    permission_classes = [IsAuthenticated, IsSystemOwner]
    serializer_class = PublicSliderImageSerializer

    def get_queryset(self):
        system_id = self.kwargs.get('system_id')
        return PublicSliderImage.objects.filter(
            system_id=system_id,
            system__owner=self.request.user
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        system_id = self.kwargs.get('system_id')
        if system_id:
            context['system'] = get_object_or_404(System, id=system_id, owner=self.request.user)
        return context

    def perform_create(self, serializer):
        system_id = self.kwargs.get('system_id')
        system = get_object_or_404(System, id=system_id, owner=self.request.user)
        serializer.save(system=system)

class PublicSystemView(APIView):
    """Public view for accessing system information"""
    permission_classes = [AllowAny]

    def get(self, request, subdomain):
        try:
            system = System.objects.get(subdomain=subdomain, is_public=True)
        except System.DoesNotExist:
            return Response(
                {"error": "System not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        data = {
            'name': system.name,
            'category': system.category,
            'description': system.description,
            'logo': system.logo.url if system.logo else None,
            'public_title': system.public_title,
            'public_description': system.public_description,
            'primary_color': system.primary_color,
            'secondary_color': system.secondary_color,
            'email': system.email,
            'whatsapp_number': system.whatsapp_number,
            'social_links': system.social_links,
            'slider_images': PublicSliderImageSerializer(
                system.slider_images.filter(is_active=True), 
                many=True
            ).data,
            'opening_hours': OpeningHoursSerializer(
                system.opening_hours.all(), 
                many=True
            ).data
        }
        return Response(data)
