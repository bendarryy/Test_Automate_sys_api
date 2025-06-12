from django.urls import path, include
from . import views 
from django.contrib import admin

urlpatterns = [
    # Authentication endpoints
    path("register/", views.register_user, name="register"), 
    path("login/", views.login_user, name="login"),  
    path("logout/", views.logout_user, name="logout"), 
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/update/', views.ProfileUpdateView.as_view(), name='profile-update'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('check-auth/', views.CheckAuthView.as_view(), name='check-auth'),
    
    # System management endpoints
    path('systems/', views.SystemRetrieveView.as_view(), name='system-list'),
    path('systems/create/', views.SystemCreateView.as_view(), name='system-create'),
    path('systems/<int:system_id>/', views.SystemUpdateView.as_view(), name='system-update'),
    path('systems/<int:system_id>/delete/', views.SystemDeleteView.as_view(), name='system-delete'),
    path('systems/<int:system_id>/subdomain/', views.update_system_subdomain, name='system-subdomain'),
    path('systems/<int:system_id>/logo/', views.SystemLogoView.as_view(), name='system-logo'),
    path('systems/<int:system_id>/detail/', views.SystemDetailView.as_view(), name='system-detail'),

    # System nested endpoints
    path('systems/<int:system_id>/public-profile/', views.PublicProfileViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update'
    }), name='system-public-profile'),
    path('systems/<int:system_id>/slider-images/', views.PublicSliderImageViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='system-slider-images'),
    
    # Employee management endpoints
    path('systems/<int:system_id>/employees/', views.EmployeeListView.as_view(), name='employee-list'),
    path('systems/<int:system_id>/employees/<int:employee_id>/', views.EmployeeDetailView.as_view(), name='employee-detail'),
    path('systems/<int:system_id>/employees/invite/', views.EmployeeInviteView.as_view(), name='employee-invite'),
    path('employee/login/', views.EmployeeLoginView.as_view(), name='employee-login'),
    path('employee/logout/', views.EmployeeLogoutView.as_view(), name='employee-logout'),
]
