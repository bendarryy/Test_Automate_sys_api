# middleware/subdomain.py
import logging

logger = logging.getLogger(__name__)

class PublicSubdomainMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Extract subdomain from X-Subdomain header
        x_subdomain = request.headers.get('X-Subdomain')
        if x_subdomain:
            request.subdomain = x_subdomain
            logger.info(f"Subdomain extracted from header: {x_subdomain}")
        else:
            request.subdomain = None
            logger.warning("Subdomain could not be extracted from header.")

        response = self.get_response(request)
        return response
