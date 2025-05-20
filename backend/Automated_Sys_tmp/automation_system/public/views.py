from django.shortcuts import render
from django.http import Http404
from core.models import System
from restaurant.views import public_view as restaurant_public_view
from supermarket.views import public_view as supermarket_public_view

def get_system_from_host(request):
    """Get system from hostname (subdomain)"""
    host = request.get_host().split(':')[0]  # Remove port if present
    subdomain = host.split('.')[0]  # Get subdomain
    
    try:
        system = System.objects.get(
            subdomain=subdomain,
            is_active=True
        )
        return system
    except System.DoesNotExist:
        raise Http404("System not found")

def public_view(request):
    """Main public view that routes based on system type"""
    system = get_system_from_host(request)
    
    if not system.is_public:
        raise Http404("System is not public")
    
    # Add system to request for templates
    request.system = system
    
    # Route based on system category
    if system.category == 'restaurant':
        return restaurant_public_view(request)
    elif system.category == 'supermarket':
        return supermarket_public_view(request)
    else:
        raise Http404("Invalid system category")
