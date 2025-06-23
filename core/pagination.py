
from rest_framework.pagination import PageNumberPagination

class CustomPagination(PageNumberPagination):
    page_query_param = 'page'
    page_size_query_param = 'rows'
    max_page_size = 100

    def get_page_size(self, request):
        rows = request.query_params.get(self.page_size_query_param)
        if rows == 'mid':
            return 20
        elif rows == 'high':
            return 50
        elif rows == 'low':
            return 10
        return super().get_page_size(request)
