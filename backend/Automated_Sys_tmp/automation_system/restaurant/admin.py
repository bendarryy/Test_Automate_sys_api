# from django.contrib import admin
# from .models import *

# # Register your models here.
# class MultiTenantAdmin(admin.ModelAdmin):
#     def get_queryset(self, request):
#         qs = super().get_queryset(request)
#         if request.user.is_superuser:
#             return qs
#         return qs.filter(system__owner=request.user)
    
    

# @admin.register(MenuItem)
# class SomeModelAdmin(MultiTenantAdmin):
#     pass

# @admin.register(Order)
# class SomeModelAdmin(MultiTenantAdmin):
#     pass