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
from rest_framework import permissions
from django.http import HttpResponseForbidden
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.middleware.common import MiddlewareMixin

schema_view = get_schema_view(
    openapi.Info(
        title="Smart System API",
        default_version="v1",
        description="Multi-System API for core, restaurant, supermarket",
        contact=openapi.Contact(email="support@example.com"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

def block_root(request):
    return HttpResponseForbidden("Forbidden: Private API.")



urlpatterns = [
    # path("admin/", admin.site.urls),  # Admin panel URL
    path("api/accounts/", include("django.contrib.auth.urls")),  # Authentication URLs
    path("api/core/", include("core.urls")),  # Core app URLs
    path("api/restaurant/", include("restaurant.urls")),  # Restaurant app URLs
    path("api/supermarket/", include("supermarket.urls")),  # Supermarket app URLs
    # path("api/cafe/", include("cafe.urls")),  # Cafe app URLs
    # Swagger & Redoc documentation
    # path("swagger/", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
    # path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
    path('', block_root, name='api-root'),  # Provide API root response
    path('public/', include('public.urls')),  # Restrict public API access
]

# Add subdomain handling only in DEBUG mode
# if settings.DEBUG:
#     urlpatterns = [
#         path('restaurant/', include('restaurant.urls')),  # Handle public view for subdomains
#         path('supermarket/', include('supermarket.urls')),  # Handle public view for subdomains
#     ] + urlpatterns  # Add all other URLs after

# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
