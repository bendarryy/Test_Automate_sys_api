
from django.contrib import admin
from restaurant.models import *
from core.models import System


class MultiTenantAdminMixin(admin.ModelAdmin):
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs  # superusers see all

        # For non-superusers, filter by system ownership
        return qs.filter(system__owner=request.user)

@admin.register(MenuItem)
class MenuItemAdmin(MultiTenantAdminMixin, admin.ModelAdmin):
     list_display = ('name' , 'price' , 'is_available', 'system'  )
     search_fields = ('name',)  
    #  readonly_fields = ('system',) # will be uncomment 



@admin.register(Order)
class OrderAdmin(MultiTenantAdminMixin, admin.ModelAdmin):
      
      list_display = ('customer_name' , 'total_price' , 'created_at', 'system'  )
      search_fields = ('name',)  
    #   readonly_fields = ('system',)  # will be uncomment 



# @admin.register(System)
# class SystemAdmin(MultiTenantAdminMixin, admin.ModelAdmin):   
#         list_display = ('name' ,)    # 'owner' , 'category' )
#         search_fields = ('name',)  



# @admin.register(Order)
# class SomeModelAdmin(MultiTenantAdmin):
#     pass





# Register your models here.
# from django.contrib import admin
# from django.apps import apps

# # Register your models here.

# # from django.contrib import admin
# from core.models import System 

# @admin.register(System)
# class SystemAdmin(admin.ModelAdmin):
#     list_display = ("name", "category", "owner")
#     list_filter = ("category",)
#     search_fields = ("name", "owner__username")

#     def get_queryset(self, request):
#         qs = super().get_queryset(request)
#         if request.user.is_superuser:
#             return qs  # Superusers see all systems
#         return qs.filter(owner=request.user)  # Staff users see only their own systems

#     def has_view_permission(self, request, obj=None):
#         if obj is None:  
#             return True  # Allow viewing the list
#         return obj.owner == request.user or request.user.is_superuser  # Only view own records

#     def has_change_permission(self, request, obj=None):
#         if obj is None:
#             return True
#         return obj.owner == request.user or request.user.is_superuser  # Only edit own records

#     def has_delete_permission(self, request, obj=None):
#         if obj is None:
#             return True
#         return obj.owner == request.user or request.user.is_superuser  # Only delete own records


# class SystemFilteredAdmin(admin.ModelAdmin):
#     """Automatically filters admin data to show only the logged-in user's systems"""

#     def get_queryset(self, request):
#         qs = super().get_queryset(request)
#         if request.user.is_superuser:
#             return qs  # Superusers see everything
        
#         # Get the systems owned by the logged-in user
#         user_systems = request.user.system_set.values_list('id', flat=True)

#         # Automatically filter all models linked to a System
#         return qs.filter(system_id__in=user_systems) if 'system_id' in qs.model._meta.get_fields() else qs



# # Auto-register all models from category apps
# category_apps = ['restaurant',  'core' , 'cafe', 'supermarket', 'workshop']

# for app_name in category_apps:
#     app_models = apps.get_app_config(app_name).get_models()
    
#     for model in app_models:
#         admin_class = type(f'{model.__name__}Admin', (SystemFilteredAdmin,), {})
#         admin.site.register(model, admin_class)
