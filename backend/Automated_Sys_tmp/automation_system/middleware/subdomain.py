# middleware/subdomain.py
import logging

logger = logging.getLogger(__name__)

class PublicSubdomainMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host().split(':')[0]  # remove port if any

        if host.endswith('.public.localhost'):
            subdomain = host.split('.public.localhost')[0]
            request.subdomain = subdomain
        else:
            request.subdomain = None

        response = self.get_response(request)
        return response
