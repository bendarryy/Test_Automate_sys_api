from django.shortcuts import render, redirect
from .models import (
    Employee,
    System,
    PublicSliderImage,
    OpeningHours,
    PasswordResetOTP,
    Profile,
    TwoFactorEmailCode,
    UserTwoFactorInfo,
    TwoFATempSession,
)
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
    OpeningHoursSerializer,
    SystemPublicProfileSerializer,
    SystemLogoUpdateSerializer,
    ForgotPasswordSerializer,
    VerifyOTPSerializer,
    ResetPasswordSerializer,
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
from django.utils.decorators import method_decorator
import random
import string
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.http import HttpResponse
from django.utils.crypto import get_random_string
import base64
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.db import models
import os
import mimetypes
from django.http import FileResponse, Http404
from pathlib import Path
import logging
import uuid

logger = logging.getLogger(__name__)
from pathlib import Path


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


@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    """Exmaple of  Required data :

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
        # Generate email confirmation token
        token = str(uuid.uuid4())
        # Ensure user has a profile
        profile, created = Profile.objects.get_or_create(user=user)
        profile.email_confirm_token = token
        profile.email_confirmed = False
        profile.save()
        # Send confirmation email
        frontend= "https://www.tarkeeb.online"
        confirm_url = f"{frontend}/confirm-email/{token}/" 
        send_mail(
            'Confirm your email',
            f'Please confirm your email by clicking the following link: {confirm_url}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=True,
        )
        # Generate temp session id (for pre-login or tracking)
        temp_session = TwoFATempSession.objects.create(user=user)
        return Response(
            {
                "message": "User created successfully. Please check your email to confirm your account.",
                "user_id": user.id,
                "temp_session_id": str(temp_session.id),
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors, status=status.HTTP_400_BAD_REQUEST
    )  # Return errors if validation fails


# @csrf_exempt
@api_view(["POST"])
def login_user(request):
    """e.g `{
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
            status=status.HTTP_401_UNAUTHORIZED,
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
        role = serializer.data.get("role")
        # Load actions from JSON file
        try:
            with open(settings.BASE_DIR / "core/role_actions.json") as f:
                ROLE_ACTIONS = json.load(f)
        except Exception:
            ROLE_ACTIONS = {}
        actions = ROLE_ACTIONS.get(role, [])
        # Compose response
        return Response(
            {
                "user": serializer.data.get("user"),
                "role": role,
                "systems": serializer.data.get("systems"),
                "actions": actions,
            },
            status=status.HTTP_200_OK,
        )


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
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not old_password or not new_password:
            return Response(
                {"error": "Both old_password and new_password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verify old password
        if not check_password(old_password, request.user.password):
            return Response(
                {"error": "Old password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate new password (you can add more validation rules here)
        if len(new_password) < 8:
            return Response(
                {"error": "New password must be at least 8 characters long"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update password
        request.user.password = make_password(new_password)
        request.user.save()

        return Response(
            {"message": "Password changed successfully"}, status=status.HTTP_200_OK
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
            return Response(
                {"error": "You do not own this system."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Validate input data with system ID
        serializer = EmployeeCreateSerializer(
            data={**request.data, "system": system_id}
        )
        serializer.is_valid(raise_exception=True)

        # Create employee using serializer
        employee = serializer.save()

        # Return created employee data
        return Response(
            {
                "employee": {
                    "name": employee.name,
                    "email": employee.user.email,
                    "role": employee.role,
                    "system": system.name,
                }
            },
            status=status.HTTP_201_CREATED,
        )


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

    Example :Update only passowrd/email ...  -> `{"password":"password" }`"""

    permission_classes = [IsAuthenticated, IsSystemOwner]

    def get(self, request, system_id, employee_id):
        """View employee details"""
        system = self.get_system(system_id)
        employee = self.get_employee(system, employee_id)

        # Serialize and return the employee data
        serializer = EmployeeListSerializer(employee, context={"request": request})
        return Response(serializer.data)

    @swagger_auto_schema(
        request_body=EmployeeUpdateSerializer, responses={200: EmployeeUpdateSerializer}
    )
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
        if not self._is_system_owner(request.user, system):
            return Response(
                {"error": "You do not own this system."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Delete both Employee and User
        self._delete_employee_and_user(employee)
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

    def _is_system_owner(self, user, system):
        """Check if the user is the owner of the system"""
        return system.owner == user

    def _delete_employee_and_user(self, employee):
        """Helper method to delete an employee and their associated user"""
        user = employee.user
        employee.delete()
        user.delete()


class EmployeeListView(generics.ListAPIView):
    """
    Manager lists all employees of a specific system.
    """

    serializer_class = EmployeeListSerializer
    permission_classes = [IsAuthenticated, IsSystemOwner]

    def get_queryset(self):
        system_id = self.kwargs.get("system_id")
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

            email = serializer.validated_data["email"]
            password = serializer.validated_data["password"]

            # Authenticate using Django's auth system
            user = authenticate(request, username=email, password=password)
            if user is None:
                return Response(
                    {"error": "Invalid email or password."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            # Check if the user is an employee
            try:
                employee = Employee.objects.get(user=user)
                if not employee.is_active:
                    return Response(
                        {"error": "Invalid email or password."},
                        status=status.HTTP_401_UNAUTHORIZED,
                    )
            except Employee.DoesNotExist:
                return Response(
                    {"error": "Invalid email or password."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            # Log in the user for session-based auth
            login(request, user)

            # Return employee information
            return Response(
                {
                    "employee": {
                        "id": employee.id,
                        "name": employee.name,
                        "email": user.email,
                        "role": employee.role,
                        "system": employee.system.name,
                        "actions": get_user_actions(user),
                    }
                },
                status=status.HTTP_200_OK,
            )

        except serializers.ValidationError:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        except Exception as e:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class EmployeeLogoutView(APIView):
    """
    Employee logout endpoint (Session-based)

    """

    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        logout(request)
        return Response(
            {"success": "Successfully logged out."}, status=status.HTTP_200_OK
        )


@api_view(["PATCH"])
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
            status=status.HTTP_403_FORBIDDEN,
        )

    new_subdomain = request.data.get("subdomain")
    if not new_subdomain:
        return Response(
            {"error": "Subdomain is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    # Check if subdomain is already taken
    if System.objects.filter(subdomain=new_subdomain).exclude(id=system_id).exists():
        return Response(
            {"error": "This subdomain is already taken"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Update the subdomain
    system.subdomain = new_subdomain
    system.save()

    return Response(
        {"message": "Subdomain updated successfully", "subdomain": system.subdomain}
    )


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
            "url": (
                f"https://{system.subdomain}.yourdomain.com"
                if system.subdomain
                else None
            ),
        }


class SystemCreateView(BaseSystemView):
    """Create a new system"""

    permission_classes = [IsAuthenticated]
    serializer_class = SystemCreateSerializer

    @swagger_auto_schema(
        request_body=SystemCreateSerializer,
        responses={
            201: openapi.Response(
                description="System created successfully", schema=SystemCreateSerializer
            ),
            400: "Bad Request - Invalid data",
            401: "Unauthorized - Authentication required",
        },
    )
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            try:
                system = serializer.save(owner=request.user, is_active=True)
                return Response(
                    {
                        "message": "System created successfully",
                        "system": self.get_system_response(system),
                    },
                    status=status.HTTP_201_CREATED,
                )
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SystemUpdateView(BaseSystemView):
    """Update an existing system"""

    permission_classes = [IsAuthenticated, IsSystemOwner]
    serializer_class = SystemUpdateSerializer

    @swagger_auto_schema(
        request_body=SystemUpdateSerializer,
        responses={
            200: openapi.Response(
                description="System updated successfully", schema=SystemUpdateSerializer
            ),
            400: "Bad Request - Invalid data or incorrect password",
            401: "Unauthorized - Authentication required",
            403: "Forbidden - Not the system owner",
            404: "Not Found - System not found",
        },
    )
    def patch(self, request, system_id, *args, **kwargs):
        try:
            system = System.objects.get(id=system_id)
        except System.DoesNotExist:
            return Response(
                {"error": "System not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if system.owner != request.user:
            return Response(
                {"error": "You do not have permission to update this system"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Make a mutable copy of request.data
        data = request.data.copy()
        # Remove subdomain/custom_domain if they are null
        for key in ["subdomain", "custom_domain"]:
            if key in data and data[key] is None:
                data.pop(key)

        serializer = self.serializer_class(
            system, data=data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            try:
                # Remove password from data before saving
                validated_data = serializer.validated_data
                validated_data.pop("password", None)

                updated_system = serializer.save()
                return Response(
                    {
                        "message": "System updated successfully",
                        "system": self.get_system_response(updated_system),
                    },
                    status=status.HTTP_200_OK,
                )
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, system_id, *args, **kwargs):
        """Retrieve a specific system by its ID."""
        system = get_object_or_404(System, id=system_id)
        serializer = SystemSerializer(system)
        return Response(serializer.data)


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
            404: "Not Found - System not found",
        },
    )
    def delete(self, request, system_id, *args, **kwargs):
        try:
            system = System.objects.get(id=system_id)
        except System.DoesNotExist:
            return Response(
                {"error": "System not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if system.owner != request.user:
            return Response(
                {"error": "You do not have permission to delete this system"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )

        if serializer.is_valid():
            try:
                # Delete the system
                system.delete()
                return Response(
                    {"message": "System deleted successfully"},
                    status=status.HTTP_200_OK,
                )
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
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
            401: "Unauthorized - Authentication required",
        },
    )
    def patch(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            request.user, data=request.data, context={"request": request}, partial=True
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
        return Response(
            {"is_authenticated": True, "user_id": request.user.id},
            status=status.HTTP_200_OK,
        )


class PublicProfileViewSet(viewsets.ModelViewSet):
    serializer_class = SystemPublicProfileSerializer
    permission_classes = [IsAuthenticated, IsSystemOwner]
    http_method_names = ["get", "patch"]  # Only allow GET and PATCH

    def get_object(self):
        system_id = self.kwargs.get("system_id")
        return get_object_or_404(System, id=system_id)


@method_decorator(csrf_exempt, name="dispatch")
class PublicSliderImageViewSet(viewsets.ModelViewSet):
    """Handle slider image operations"""

    permission_classes = [IsAuthenticated, IsSystemOwner]
    serializer_class = PublicSliderImageSerializer

    def get_queryset(self):
        system_id = self.kwargs.get("system_id")
        return PublicSliderImage.objects.filter(
            system_id=system_id, system__owner=self.request.user
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        system_id = self.kwargs.get("system_id")
        if system_id:
            context["system"] = get_object_or_404(
                System, id=system_id, owner=self.request.user
            )
        return context

    def perform_create(self, serializer):
        system_id = self.kwargs.get("system_id")
        system = get_object_or_404(System, id=system_id, owner=self.request.user)
        serializer.save(system=system)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PublicSystemView(APIView):
    """Public view for accessing system information"""

    permission_classes = [AllowAny]

    def get(self, request, subdomain):
        try:
            system = System.objects.get(subdomain=subdomain, is_public=True)
        except System.DoesNotExist:
            return Response(
                {"error": "System not found"}, status=status.HTTP_404_NOT_FOUND
            )

        data = {
            "name": system.name,
            "category": system.category,
            "description": system.description,
            "logo": system.logo.url if system.logo else None,
            "public_title": system.public_title,
            "public_description": system.public_description,
            "primary_color": system.primary_color,
            "secondary_color": system.secondary_color,
            "email": system.email,
            "whatsapp_number": system.whatsapp_number,
            "social_links": system.social_links,
            "slider_images": PublicSliderImageSerializer(
                system.slider_images.filter(is_active=True), many=True
            ).data,
            "opening_hours": OpeningHoursSerializer(
                system.opening_hours.all(), many=True
            ).data,
        }
        return Response(data)


class SystemLogoView(generics.UpdateAPIView):
    """
    Update the logo of a system.
    Endpoint: PATCH /api/core/systems/{system_id}/logo/
    Requires authentication and the user must be the system owner.
    """

    queryset = System.objects.all()
    serializer_class = SystemLogoUpdateSerializer
    permission_classes = [IsAuthenticated, IsSystemOwner]
    lookup_field = "system_id"  # This makes the view automatically look up the system by the system_id in the URL

    def get_object(self):
        # Ensure the user owns the system
        system = get_object_or_404(
            self.get_queryset(), id=self.kwargs[self.lookup_field]
        )
        self.check_object_permissions(self.request, system)
        return system

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        """Retrieve the logo URL of a system."""
        system = self.get_object()
        if system.logo:
            return Response({"logo_url": system.logo.url}, status=status.HTTP_200_OK)
        return Response(
            {"error": "No logo found for this system."},
            status=status.HTTP_404_NOT_FOUND,
        )


class SystemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, system_id):
        """Retrieve a specific system by its ID."""
        system = get_object_or_404(System, id=system_id)
        serializer = SystemSerializer(system)
        return Response(serializer.data)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail


class SendTestEmailView(APIView):
    def get(self, request):
        email = request.query_params.get("email")
        if not email:
            return Response(
                {"error": "Email is required in query string"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from_email = "Tarkeeb online <noreply@tarkeeb.online>"  # Set display name here

        try:
            send_mail(
                subject="Test Email",
                message="Hello Sir Mail server is wokring",
                from_email=from_email,
                recipient_list=[email],
                fail_silently=False,
            )
            return Response(
                {"message": f"Email sent to {email}"}, status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# forget password by ali
class ForgotPasswordView(APIView):
    """
    Send OTP for password reset
    Endpoint: POST /api/core/forgot-password/

    Example request body:
    {
        "email": "user@example.com"
    }
    """

    permission_classes = [AllowAny]

    @swagger_auto_schema(
        request_body=ForgotPasswordSerializer,
        responses={
            200: "OTP sent successfully",
            400: "Bad Request - Invalid email",
            404: "User not found",
        },
    )
    def post(self, request, *args, **kwargs):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            user = User.objects.get(email=email)

            # Generate 6-digit OTP
            otp_code = "".join(random.choices(string.digits, k=6))

            # Set expiration time (15 minutes from now)
            expires_at = timezone.now() + timedelta(minutes=15)

            # Create OTP record
            otp = PasswordResetOTP.objects.create(
                user=user, otp_code=otp_code, expires_at=expires_at
            )

            # Send email with OTP
            from_email = "Tarkeeb online <noreply@tarkeeb.online>"
            subject = "Password Reset OTP - Tarkeeb Online"
            message = f"""
Hello {user.username},

You have requested to reset your password. Please use the following OTP code to proceed:

OTP Code: {otp_code}

This OTP will expire in 15 minutes.

If you did not request this password reset, please ignore this email.

Best regards,
Tarkeeb Online Team
            """

            try:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=from_email,
                    recipient_list=[email],
                    fail_silently=False,
                )
                return Response(
                    {
                        "message": "OTP sent successfully to your email address.",
                        "email": email,
                    },
                    status=status.HTTP_200_OK,
                )
            except Exception as e:
                # Delete the OTP if email sending fails
                otp.delete()
                return Response(
                    {"error": "Failed to send OTP. Please try again later."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    """
    Verify OTP for password reset
    Endpoint: POST /api/core/verify-otp/

    Example request body:
    {
        "email": "user@example.com",
        "otp_code": "123456"
    }
    """

    permission_classes = [AllowAny]

    @swagger_auto_schema(
        request_body=VerifyOTPSerializer,
        responses={
            200: "OTP verified successfully",
            400: "Bad Request - Invalid OTP",
            404: "User not found",
        },
    )
    def post(self, request, *args, **kwargs):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            otp_code = serializer.validated_data["otp_code"]

            user = User.objects.get(email=email)

            # Get the most recent valid OTP for this user
            try:
                otp = PasswordResetOTP.objects.filter(
                    user=user, otp_code=otp_code, is_used=False
                ).latest("created_at")

                if otp.is_expired():
                    return Response(
                        {"error": "OTP has expired. Please request a new one."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                return Response(
                    {"message": "OTP verified successfully.", "email": email},
                    status=status.HTTP_200_OK,
                )

            except PasswordResetOTP.DoesNotExist:
                return Response(
                    {"error": "Invalid OTP code."}, status=status.HTTP_400_BAD_REQUEST
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    """
    Reset password using OTP
    Endpoint: POST /api/core/reset-password/

    Example request body:
    {
        "email": "user@example.com",
        "otp_code": "123456",
        "new_password": "newsecurepassword123"
    }
    """

    permission_classes = [AllowAny]

    @swagger_auto_schema(
        request_body=ResetPasswordSerializer,
        responses={
            200: "Password reset successfully",
            400: "Bad Request - Invalid data",
            404: "User not found",
        },
    )
    def post(self, request, *args, **kwargs):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            otp_code = serializer.validated_data["otp_code"]
            new_password = serializer.validated_data["new_password"]

            user = User.objects.get(email=email)

            # Get the most recent valid OTP for this user
            try:
                otp = PasswordResetOTP.objects.filter(
                    user=user, otp_code=otp_code, is_used=False
                ).latest("created_at")

                if otp.is_expired():
                    return Response(
                        {"error": "OTP has expired. Please request a new one."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Update user password
                user.set_password(new_password)
                user.save()

                # Mark OTP as used
                otp.is_used = True
                otp.save()

                # Invalidate all other OTPs for this user
                PasswordResetOTP.objects.filter(user=user, is_used=False).update(
                    is_used=True
                )

                return Response(
                    {
                        "message": "Password reset successfully. You can now login with your new password."
                    },
                    status=status.HTTP_200_OK,
                )

            except PasswordResetOTP.DoesNotExist:
                return Response(
                    {"error": "Invalid OTP code."}, status=status.HTTP_400_BAD_REQUEST
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST", "GET"])
@permission_classes([IsAuthenticated])
def select_system(request):
    """
    Endpoint to log the last selected system, store it, and retrieve it later.
    POST: Store the selected system. If system_id is null, clear the selection.
    GET: Retrieve the last selected system.
    Example POST request body:
    {
        "system_id": 5  // or "system_id": null to clear
    }
    """
    # Ensure user has a profile
    profile, created = Profile.objects.get_or_create(user=request.user)

    if request.method == "POST":
        system_id = request.data.get("system_id")

        # If system_id is null or not provided, clear the last selected system.
        if system_id is None:
            profile.last_selected_system_id = None
            profile.save()
            return Response(
                {"message": "System selection cleared"}, status=status.HTTP_200_OK
            )

        try:
            # Ensure the provided ID is for a system owned by the user.
            system = System.objects.get(id=system_id, owner=request.user)
        except System.DoesNotExist:
            return Response(
                {"error": "System not found or you do not own this system"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except (ValueError, TypeError):
            # Handle cases where system_id is not a valid integer.
            return Response(
                {"error": "Invalid System ID format."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Store the selected system in the user's profile
        profile.last_selected_system_id = system.id
        profile.save()

        return Response(
            {"message": "System selected successfully", "system_id": system.id},
            status=status.HTTP_200_OK,
        )

    elif request.method == "GET":
        # Retrieve the last selected system from the user's profile
        system_id = getattr(profile, "last_selected_system_id", None)
        if not system_id:
            return Response(
                {"error": "No system selected"}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            system = System.objects.get(id=system_id, owner=request.user)
        except System.DoesNotExist:
            # This can happen if the system was deleted but the profile still holds its ID.
            # Clear the invalid ID from the profile.
            profile.last_selected_system_id = None
            profile.save()
            return Response(
                {
                    "error": "Previously selected system not found. It may have been deleted."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "message": "Last selected system retrieved successfully",
                "system_id": system_id,
                "system_name": system.name,
                "category": system.category,
            },
            status=status.HTTP_200_OK,
        )


class TwoFactorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get current 2FA status for the authenticated user"""
        user = request.user
        twofa_info, _ = UserTwoFactorInfo.objects.get_or_create(user=user)

        return Response({"is_enabled": twofa_info.enabled, "email": user.email})

    def post(self, request):
        user = request.user
        twofa_info, _ = UserTwoFactorInfo.objects.get_or_create(user=user)
        action = request.data.get("action")

        if action == "enable":
            code = "".join(random.choices(string.digits, k=6))
            expires_at = timezone.now() + timedelta(minutes=10)
            TwoFactorEmailCode.objects.create(
                user=user, code=code, expires_at=expires_at
            )
            send_mail(
                "Your 2FA Code",
                f"Your 2FA code is: {code}",
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
            )
            return Response(
                {"message": "2FA code sent to your email. Please verify to enable 2FA."}
            )

        elif action == "verify":
            code = request.data.get("code")
            otp = TwoFactorEmailCode.objects.filter(
                user=user, code=code, is_used=False, expires_at__gte=timezone.now()
            ).first()
            if otp:
                otp.is_used = True
                otp.save()
                twofa_info.enabled = True
                twofa_info.save()
                return Response({"message": "2FA enabled successfully."})
            return Response({"error": "Invalid or expired code."}, status=400)

        elif action == "disable":
            if not twofa_info.enabled:
                return Response({"error": "2FA is not enabled."}, status=400)

            code = "".join(random.choices(string.digits, k=6))
            expires_at = timezone.now() + timedelta(minutes=10)
            TwoFactorEmailCode.objects.create(
                user=user, code=code, expires_at=expires_at
            )

            print(
                f"DEBUG: About to send disable email to {user.email} with code {code}"
            )
            # Use EXACTLY the same pattern as enable action
            send_mail(
                "Your 2FA Code",  # Same subject as enable
                f"Your 2FA code is: {code}",  # Same message format as enable
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
            )
            print(f"DEBUG: Disable email sent successfully to {user.email}")
            return Response(
                {"message": "Confirmation code sent. Please verify to disable 2FA."}
            )

        elif action == "disable_confirm":
            code = request.data.get("code")
            otp = TwoFactorEmailCode.objects.filter(
                user=user, code=code, is_used=False, expires_at__gte=timezone.now()
            ).first()
            if otp:
                otp.is_used = True
                otp.save()
                twofa_info.enabled = False
                twofa_info.save()
                return Response({"message": "2FA disabled successfully."})
            return Response(
                {"error": "Invalid or expired confirmation code."}, status=400
            )

        return Response({"error": "Invalid action."}, status=400)


class ConfirmEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        # You need to implement a model to store confirmation tokens!
        # For demo, let's assume Profile has a field email_confirm_token
        try:
            profile = Profile.objects.get(email_confirm_token=token)
            profile.email_confirmed = True
            profile.email_confirm_token = ""
            profile.save()
            return Response(
                {"message": "Email confirmed successfully."}, status=status.HTTP_200_OK
            )
        except Profile.DoesNotExist:
            return Response(
                {"error": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = TokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")
        temp_session_id = request.data.get("temp_session_id")
        code = request.data.get("code")

        if username and password:
            user = authenticate(request, username=username, password=password)
            if not user:
                raise AuthenticationFailed(
                    "No active account found with the given credentials"
                )
            # Only check email confirmation for non-employees
            from .models import Employee
            is_employee = Employee.objects.filter(user=user).exists()
            if not is_employee:
                try:
                    profile = user.profile
                    if not getattr(profile, 'email_confirmed', False):
                        return Response(
                            {"error": "Please confirm your email before logging in."},
                            status=status.HTTP_403_FORBIDDEN,
                        )
                except Exception:
                    return Response(
                        {"error": "Email confirmation status could not be verified. Contact support."},
                        status=status.HTTP_403_FORBIDDEN,
                    )

            twofa_info, _ = UserTwoFactorInfo.objects.get_or_create(user=user)
            if twofa_info.enabled:
                temp_session = TwoFATempSession.objects.create(user=user)
                code_val = "".join(random.choices(string.digits, k=6))
                expires_at = timezone.now() + timedelta(minutes=10)
                TwoFactorEmailCode.objects.create(
                    user=user, code=code_val, expires_at=expires_at
                )
                send_mail(
                    "Your 2FA Code",
                    f"Your 2FA code is: {code_val}",
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                )
                return Response(
                    {
                        "twofa_required": True,
                        "temp_session_id": str(temp_session.id),
                        "detail": "A code has been sent to your email.",
                    }
                )
            else:
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)

                # Add user actions to the response
                data = serializer.validated_data
                data["actions"] = get_user_actions(user)
                return Response(data)

        elif temp_session_id and code:
            try:
                temp_session = TwoFATempSession.objects.get(
                    id=temp_session_id, is_active=True
                )
                if not temp_session.is_valid():
                    raise AuthenticationFailed("2FA session has expired.")

                user = temp_session.user
                otp = TwoFactorEmailCode.objects.filter(
                    user=user, code=code, is_used=False, expires_at__gte=timezone.now()
                ).first()
                if not otp:
                    raise AuthenticationFailed("Invalid or expired 2FA code.")

                otp.is_used = True
                otp.save()
                temp_session.is_active = False
                temp_session.save()

                refresh = RefreshToken.for_user(user)
                data = {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "actions": get_user_actions(user),  # Also add actions here
                }
                return Response(data)
            except (TwoFATempSession.DoesNotExist, ValueError):
                raise AuthenticationFailed("Invalid 2FA session.")

        return Response(
            {"detail": "Invalid request."}, status=status.HTTP_400_BAD_REQUEST
        )


class DownloadView(APIView):
    """
    Universal download endpoint for various file types
    Endpoint: GET /api/core/download/

    Query Parameters:
    - file_path: Path to the file relative to MEDIA_ROOT or absolute path
    - file_type: Type of file (optional, for better error handling)
    - filename: Custom filename for download (optional)

    Examples:
    - /api/core/download/?file_path=product_images/item1.jpg
    - /api/core/download/?file_path=reports/sales_report.pdf&filename=monthly_sales.pdf
    - /api/core/download/?file_path=/absolute/path/to/file.xlsx
    """

    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        try:
            # Get file path from query parameters
            file_path = request.GET.get("file_path")
            file_type = request.GET.get("file_type", "")
            custom_filename = request.GET.get("filename", "")

            if not file_path:
                return Response(
                    {"error": "file_path parameter is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Handle both relative and absolute paths
            if os.path.isabs(file_path):
                # Absolute path provided
                full_path = Path(file_path)
            else:
                # Relative path - assume it's relative to MEDIA_ROOT
                full_path = Path(settings.MEDIA_ROOT) / file_path

            # Security check: Ensure the file is within allowed directories
            if not self._is_safe_path(full_path):
                return Response(
                    {"error": "Access denied: File path not allowed"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Check if file exists
            if not full_path.exists():
                return Response(
                    {"error": "File not found"}, status=status.HTTP_404_NOT_FOUND
                )

            # Check if it's actually a file
            if not full_path.is_file():
                return Response(
                    {"error": "Path is not a file"}, status=status.HTTP_400_BAD_REQUEST
                )

            # Get file size for logging
            file_size = full_path.stat().st_size

            # Determine MIME type
            mime_type, _ = mimetypes.guess_type(str(full_path))
            if not mime_type:
                mime_type = "application/octet-stream"

            # Use custom filename if provided, otherwise use original filename
            download_filename = custom_filename if custom_filename else full_path.name

            # Log the download attempt
            logger.info(
                f"Download requested by user {request.user.username}: {full_path} ({file_size} bytes)"
            )

            # Open and serve the file
            try:
                file_handle = open(full_path, "rb")
                response = FileResponse(
                    file_handle,
                    content_type=mime_type,
                    as_attachment=True,
                    filename=download_filename,
                )

                # Add headers for better download experience
                response["Content-Disposition"] = (
                    f'attachment; filename="{download_filename}"'
                )
                response["Content-Length"] = file_size
                response["Cache-Control"] = "no-cache, no-store, must-revalidate"
                response["Pragma"] = "no-cache"
                response["Expires"] = "0"

                return response

            except Exception as e:
                logger.error(f"Error opening file {full_path}: {str(e)}")
                return Response(
                    {"error": "Error reading file"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        except Exception as e:
            logger.error(f"Download error: {str(e)}")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _is_safe_path(self, file_path):
        """
        Check if the file path is safe to access
        Only allow files within MEDIA_ROOT or specific allowed directories
        """
        try:
            # Convert to absolute path
            abs_path = file_path.resolve()

            # Allow files within MEDIA_ROOT
            media_root = Path(settings.MEDIA_ROOT).resolve()
            if abs_path.is_relative_to(media_root):
                return True

            # Allow files within STATIC_ROOT if it exists
            if hasattr(settings, "STATIC_ROOT") and settings.STATIC_ROOT:
                static_root = Path(settings.STATIC_ROOT).resolve()
                if abs_path.is_relative_to(static_root):
                    return True

            # Add other safe directories here if needed
            # For example, if you have a specific reports directory:
            # reports_dir = Path('/path/to/reports').resolve()
            # if abs_path.is_relative_to(reports_dir):
            #     return True

            return False

        except Exception:
            return False


class SystemDownloadView(APIView):
    """
    Download files specific to a system
    Endpoint: GET /api/core/systems/{system_id}/download/

    Query Parameters:
    - file_path: Path to the file relative to system's directory
    - file_type: Type of file (optional)
    - filename: Custom filename for download (optional)

    Examples:
    - /api/core/systems/5/download/?file_path=reports/sales.pdf
    - /api/core/systems/5/download/?file_path=exports/products.xlsx
    """

    permission_classes = [AllowAny]

    def get(self, request, system_id, *args, **kwargs):
        try:
            # Get the system but DO NOT verify ownership for public access
            system = get_object_or_404(System, id=system_id)
            
            # The ownership check is removed to allow public access
            # if not self._is_system_owner(request.user, system): ...

            # Get file path from query parameters
            file_path = request.GET.get("file_path")
            file_type = request.GET.get("file_type", "")
            custom_filename = request.GET.get("filename", "")

            if not file_path:
                return Response(
                    {"error": "file_path parameter is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Create system-specific directory path
            system_dir = Path(settings.MEDIA_ROOT) / f"systems/{system_id}"
            full_path = system_dir / file_path

            # Security check: Ensure the file is within the system's directory
            if not full_path.resolve().is_relative_to(system_dir.resolve()):
                return Response(
                    {"error": "Access denied: File path not allowed"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Check if file exists
            if not full_path.exists():
                return Response(
                    {"error": "File not found"}, status=status.HTTP_404_NOT_FOUND
                )

            # Check if it's actually a file
            if not full_path.is_file():
                return Response(
                    {"error": "Path is not a file"}, status=status.HTTP_400_BAD_REQUEST
                )

            # Get file size for logging
            file_size = full_path.stat().st_size

            # Determine MIME type
            mime_type, _ = mimetypes.guess_type(str(full_path))
            if not mime_type:
                mime_type = "application/octet-stream"

            # Use custom filename if provided, otherwise use original filename
            download_filename = custom_filename if custom_filename else full_path.name

            # Log the download attempt
            logger.info(
                f"System download requested by user {request.user.username} for system {system_id}: {full_path} ({file_size} bytes)"
            )

            # Open and serve the file
            try:
                file_handle = open(full_path, "rb")
                response = FileResponse(
                    file_handle,
                    content_type=mime_type,
                    as_attachment=True,
                    filename=download_filename,
                )

                # Add headers for better download experience
                response["Content-Disposition"] = (
                    f'attachment; filename="{download_filename}"'
                )
                response["Content-Length"] = file_size
                response["Cache-Control"] = "no-cache, no-store, must-revalidate"
                response["Pragma"] = "no-cache"
                response["Expires"] = "0"

                return response

            except Exception as e:
                logger.error(f"Error opening file {full_path}: {str(e)}")
                return Response(
                    {"error": "Error reading file"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        except Exception as e:
            logger.error(f"System download error: {str(e)}")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _is_system_owner(self, user, system):
        """Check if user is the owner of the system"""
        return system.owner == user


class TarkeebExeDownloadView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        from django.conf import settings
        from pathlib import Path
        import mimetypes

        file_path = Path(settings.MEDIA_ROOT) / "downloads/tarkeeb.exe"
        if not file_path.exists() or not file_path.is_file():
            return Response({"error": "File not found"}, status=404)
        mime_type, _ = mimetypes.guess_type(str(file_path))
        if not mime_type:
            mime_type = "application/octet-stream"
        file_handle = open(file_path, "rb")
        response = FileResponse(
            file_handle,
            content_type=mime_type,
            as_attachment=True,
            filename="tarkeeb.exe",
        )
        response["Content-Disposition"] = 'attachment; filename="tarkeeb.exe"'
        return response


class TarkeebAppImageDownloadView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        from django.conf import settings
        from pathlib import Path
        import mimetypes

        file_path = Path(settings.MEDIA_ROOT) / "downloads/tarkeeb.AppImage"
        if not file_path.exists() or not file_path.is_file():
            return Response({"error": "File not found"}, status=404)
        mime_type, _ = mimetypes.guess_type(str(file_path))
        if not mime_type:
            mime_type = "application/octet-stream"
        file_handle = open(file_path, "rb")
        response = FileResponse(
            file_handle,
            content_type=mime_type,
            as_attachment=True,
            filename="tarkeeb.AppImage",
        )
        response["Content-Disposition"] = 'attachment; filename="tarkeeb.AppImage"'
        return response


class TarkeebApkDownloadView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        from django.conf import settings
        from pathlib import Path
        import mimetypes

        file_path = Path(settings.MEDIA_ROOT) / "downloads/tarkeeb.apk"
        if not file_path.exists() or not file_path.is_file():
            return Response({"error": "File not found"}, status=404)
        mime_type, _ = mimetypes.guess_type(str(file_path))
        if not mime_type:
            mime_type = "application/vnd.android.package-archive"
        file_handle = open(file_path, "rb")
        response = FileResponse(
            file_handle,
            content_type=mime_type,
            as_attachment=True,
            filename="tarkeeb.apk",
        )
        response["Content-Disposition"] = 'attachment; filename="tarkeeb.apk"'
        return response


def get_all_actions():
    """Helper function to load all possible actions from the JSON file."""
    actions = set()
    file_path = Path(settings.BASE_DIR) / "core" / "role_actions.json"
    with open(file_path, "r") as f:
        data = json.load(f)
        for role in data:
            actions.update(data[role])
    return list(actions)


def get_user_actions(user):
    """
    Determines the actions a user can perform based on their role.
    If the user is an owner, they get all permissions.
    """
    try:
        # Check if the user is an owner of any system
        if hasattr(user, "owned_systems") and user.owned_systems.exists():
            return get_all_actions()

        # Check if the user is an employee and get their role
        employee = Employee.objects.get(user=user)
        role = employee.role

        file_path = Path(settings.BASE_DIR) / "core" / "role_actions.json"
        with open(file_path, "r") as f:
            data = json.load(f)
            return data.get(role, [])

    except Employee.DoesNotExist:
        # User is not an employee, might be an owner without a system yet
        # or a regular user. We assume they are an owner for simplicity here.
        # A more robust system might differentiate.
        if user.is_superuser or (
            hasattr(user, "owned_systems") and user.owned_systems.exists()
        ):
            return get_all_actions()
        return []  # Default to no permissions if not an employee or owner
    except (FileNotFoundError, json.JSONDecodeError):
        return []
