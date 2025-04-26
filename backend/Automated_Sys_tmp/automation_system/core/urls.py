from django.urls import path
from core import views 
from django.contrib import admin

urlpatterns = [
    
    # path("admin/", admin.site.urls),  # Centralized admin panel
    path("register/", views.register_user, name="register"),  # Registration endpoint
    path("login/", views.login_user, name="login"),  # Login endpoint
    path("logout/", views.logout_user, name="logout"),  # Logout endpoint
    path("create-system/", views.create_system, name="create_system"),  # System creation endpoint
    path("systems/", views.SystemRetrieveView.as_view(), name="systems"),
    # Employee
    path('<int:system_id>/invite/', views.EmployeeInviteView.as_view(), name='employee-invite'),
    path('employee/login/', views.EmployeeLoginView.as_view(), name='employee-login'),
    path('employee/logout/', views.EmployeeLogoutView.as_view(), name='employee-logout'),
]
