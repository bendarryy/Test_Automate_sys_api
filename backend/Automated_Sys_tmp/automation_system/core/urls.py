from django.urls import path
from core import views 
from django.contrib import admin

urlpatterns = [
    
    # path("admin/", admin.site.urls),  # Centralized admin panel
    
    
    path("register/", views.register_user, name="register"), 
    path("login/", views.login_user, name="login"),  
    path("logout/", views.logout_user, name="logout"), 
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
   
    path('<int:system_id>/invite/', views.EmployeeInviteView.as_view(), name='employee-invite'),
    path('<int:system_id>/employees/', views.EmployeeListView.as_view(), name='employee-list'),
    path('<int:system_id>/employees/<int:employee_id>/', views.EmployeeDetailView.as_view(), name='employee-detail'),
    path('employee/login/', views.EmployeeLoginView.as_view(), name='employee-login'),
    path('employee/logout/', views.logout_user, name='employee-logout'),
    
    
    path("create-system/", views.create_system, name="create_system"),  # System creation endpoint
    path("systems/", views.SystemRetrieveView.as_view(), name="systems"),
    path('systems/', views.create_system, name='create_system'),
    path('systems/list/', views.SystemRetrieveView.as_view(), name='system_list'),
    path('systems/<int:system_id>/subdomain/', views.update_system_subdomain, name='update_system_subdomain'),
    path('systems/create/', views.SystemCreateView.as_view(), name='system_create'),  # New enhanced system creation endpoint
]
