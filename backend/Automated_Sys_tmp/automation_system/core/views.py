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
from rest_framework.permissions import IsAuthenticated
from .serializers import SystemSerializer, UserSerializer, SystemListSerializer
from rest_framework.generics import RetrieveAPIView, ListAPIView
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView


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

# from .serializers import EmployeeSerializer, EmployeeCreateSerializer, EmployeeLoginSerializer
# from rest_framework.permissions import AllowAny
# from rest_framework_simplejwt.tokens import RefreshToken
# # from rest_framework_simplejwt.views import TokenBlacklistView

# class EmployeeInviteView(generics.CreateAPIView):
#     """Manager invites an employee to a specific system"""
#     serializer_class = EmployeeCreateSerializer

#     def perform_create(self, serializer):
#         system_id = self.kwargs.get('system_id')
#         system = get_object_or_404(System, id=system_id)
#         serializer.save(system=system)


# class EmployeeLoginView(APIView):
#     """Employee login endpoint"""
#     permission_classes = [AllowAny]

#     def post(self, request, *args, **kwargs):
#         serializer = EmployeeLoginSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         email = serializer.validated_data['email']
#         password = serializer.validated_data['password']

#         try:
#             employee = Employee.objects.get(email=email, is_active=True)
#         except Employee.DoesNotExist:
#             return Response({"error": "Invalid login credentials"}, status=status.HTTP_400_BAD_REQUEST)

#         if not employee.check_password(password):
#             return Response({"error": "Invalid login credentials"}, status=status.HTTP_400_BAD_REQUEST)

#         refresh = RefreshToken.for_user(employee)

#         return Response({
#             "refresh": str(refresh),
#             "access": str(refresh.access_token),
#             "employee": EmployeeSerializer(employee).data
#         })


# class EmployeeLogoutView(APIView):
#     """Employee logout (invalidate refresh token)"""
#     permission_classes = [AllowAny]

#     def post(self, request, *args, **kwargs):
#         try:
#             refresh_token = request.data["refresh"]
#             token = RefreshToken(refresh_token)
#             token.blacklist()
#             return Response(status=status.HTTP_205_RESET_CONTENT)
#         except Exception as e:
#             return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)