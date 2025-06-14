from django.shortcuts import render
from django.http import Http404
from core.models import System
from restaurant.views import restaurant_public_view
from supermarket.views import supermarket_public_view
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from core.serializers import PublicSystemSerializer, PublicSliderImageSerializer
from rest_framework.request import Request as DRFRequest


def get_system_from_request(request):
    """
    Get system from request, handling both Django and DRF request types.
    Returns (system, error_response) tuple.
    """
    try:
        # Handle both Django and DRF request types
        if isinstance(request, DRFRequest):
            request = request._request  # Convert to native Django HttpRequest
            
        host = request.get_host().split(':')[0]
        subdomain = host.split('.')[0]

        if not subdomain:
            return None, Response(
                {"error": "Subdomain not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        system = System.objects.get(subdomain=subdomain)
        if not system.is_public or not system.is_active:
            return None, Response(
                {"error": "System is not public or active"},
                status=status.HTTP_403_FORBIDDEN
            )

        return system, None

    except System.DoesNotExist:
        return None, Response(
            {"error": "System not found"},
            status=status.HTTP_404_NOT_FOUND
        )


def get_common_system_data(system):
    """
    Get common system data including slider images.
    """
    return {
        'name': system.name,
        'description': system.description,
        'category': system.category,
        # 'phone_number': system.phone_number,
        # 'latitude': system.latitude,
        # 'longitude': system.longitude,
        'custom_domain': system.custom_domain,
        'logo': system.logo.url if system.logo else None,
        'public_title': system.public_title,
        'public_description': system.public_description,
        'primary_color': system.primary_color,
        'secondary_color': system.secondary_color,
        
        'custom_link': system.custom_link,
        'design_settings': system.design_settings,
        # 'email': system.email,
        'whatsapp_number': system.whatsapp_number,
        'design_settings' : system.design_settings,
        'social_links': system.social_links,
        'slider_images': PublicSliderImageSerializer(
            system.slider_images.filter(is_active=True), 
            many=True
        ).data
    }


def public_view(request):
    """
    Main public view that routes based on system type.
    """
    # Convert DRF request to Django request if needed
    django_request = request._request if isinstance(request, DRFRequest) else request
    
    system, error_response = get_system_from_request(django_request)
    if error_response:
        return error_response

    # Get common system data
    common_data = get_common_system_data(system)

    # Route to specific view based on category
    if system.category == 'restaurant':
        response = restaurant_public_view(django_request, system)
        response.data['system'] = common_data
        return response
    elif system.category == 'supermarket':
        response = supermarket_public_view(django_request, system)
        response.data['system'] = common_data
        return response
    else:
        return Response(
            {"error": "Invalid system category"},
            status=status.HTTP_400_BAD_REQUEST
        )
