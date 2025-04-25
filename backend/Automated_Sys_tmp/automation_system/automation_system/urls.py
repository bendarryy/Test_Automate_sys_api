"""
URL configuration for automation_system project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),  # Admin panel URL
    path("api/accounts/", include("django.contrib.auth.urls")),  # Authentication URLs
    path(
        "api/core/", include("core.urls")
    ),  # URLs for the core app (e.g., user management)
    path("api/restaurant/", include("restaurant.urls")),  # URLs for the restaurant app
    path("api/inventory/", include("inventory.urls")),
    # path("api/cafe/", include("cafe.urls")),  # URLs for the cafe app
    # path("api/supermarket/", include("supermarket.urls")),  # URLs for the supermarket app
    # path("api/workshop/", include("workshop.urls")),  # URLs for the workshop app
]
