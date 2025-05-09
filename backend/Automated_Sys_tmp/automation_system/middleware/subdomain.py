# middleware/subdomain.py
import logging

logger = logging.getLogger(__name__)

class PublicSubdomainMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host().split(':')[0]  # remove port if any
        logger.info(f"Processing request for host: {host}")
        logger.info(f"Full request path: {request.path}")
        logger.info(f"Request headers: {request.headers}")

        if host.endswith('.public.localhost'):
            subdomain = host.split('.public.localhost')[0]
            request.subdomain = subdomain
            logger.info(f"Found subdomain: {subdomain}")
        else:
            request.subdomain = None
            logger.info("No subdomain found")

        response = self.get_response(request)
        return response
