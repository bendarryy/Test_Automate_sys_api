from django.urls import path
from . import views

urlpatterns = [
    path('', views.public_view.as_view(), name='public-view'),  # Root URL for subdomain
    path('menu/', views.public_view.as_view(), name='public-menu'),  # Keep menu URL for backward compatibility
] 