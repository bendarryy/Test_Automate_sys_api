from django.urls import path
from . import views

urlpatterns = [
    path('', views.public_view.as_view(), name='public-view'),
    path('menu/', views.public_view.as_view(), name='public-menu'),
    path('barcode/<str:barcode>/', views.public_barcode_view.as_view(), name='public-barcode-view'),
] 