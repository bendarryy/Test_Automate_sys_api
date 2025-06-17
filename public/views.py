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
from rest_framework.renderers import JSONRenderer
from rest_framework.views import APIView
from supermarket.models import Product
import logging

logger = logging.getLogger(__name__)

# Debug: Print when the view is defined
print("Defining public_barcode_view")

def extract_subdomain_from_url(request):
    """
    Extract subdomain from the request URL.
    """
    host = request.get_host().split(':')[0]
    return host.split('.')[0]


def get_system_from_request(request):
    """
    Get system from request, handling both Django and DRF request types.
    Returns (system, error_response) tuple.
    """
    try:
        # Handle both Django and DRF request types
        if isinstance(request, DRFRequest):
            request = request._request  # Convert to native Django HttpRequest

        # Use x-subdomain header directly
        subdomain = request.headers.get('x-subdomain')
        if not subdomain:
            return None, Response(
                {"error": "Access denied"},
                status=status.HTTP_403_FORBIDDEN
            )

        system = System.objects.get(subdomain=subdomain)
        if not system.is_public or not system.is_active:
            return None, Response(
                {"error": "Access denied"},
                status=status.HTTP_403_FORBIDDEN
            )

        return system, None

    except System.DoesNotExist:
        return None, Response(
            {"error": "Access denied"},
            status=status.HTTP_403_FORBIDDEN
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


class public_view(APIView):
    """
    Main public view that routes based on system type.
    """
    def get(self, request):
        # Convert DRF request to Django HttpRequest
        if isinstance(request, DRFRequest):
            request = request._request

        system, error_response = get_system_from_request(request)
        if error_response:
            return error_response

        # Get common system data
        common_data = get_common_system_data(system)

        # Route to specific view based on category
        if system.category == 'restaurant':
            response = restaurant_public_view(request, system)
            response.data['system'] = common_data
            response['x-category'] = 'restaurant'  # Add x-category header
        elif system.category == 'supermarket': 
            response = supermarket_public_view(request, system)
            response.data['system'] = common_data
            response['x-category'] = 'supermarket'  # Add x-category header
        else:
            return Response(
                {"error": "Invalid system category"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return response


class public_barcode_view(APIView):
    """
    Public barcode view that handles subdomain checking and returns product details.
    """
    def get(self, request, barcode):
        # Use the existing system check logic
        system, error_response = get_system_from_request(request)
        if error_response:
            return error_response

        try:
            product = Product.objects.get(system=system, barcode=barcode, stock_quantity__gt=0)
            product_data = {
                "id": product.id,
                "name": product.name,
                "category": product.category,
                "price": str(product.price),
                "barcode": product.barcode,
                "image": product.image.url if product.image else None,
            }
            return Response(product_data)
        except Product.DoesNotExist:
            return Response(
                {"detail": "Product not found with the given barcode."},
                status=status.HTTP_404_NOT_FOUND,
            )
