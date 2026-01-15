from django.urls import path
from . import views

urlpatterns = [
    path('products/', views.product_list, name='product_list'),
    path('products/<int:pk>/', views.product_detail, name='product_detail'),
    path('products/<int:pk>/stock/', views.adjust_stock, name='adjust_stock'),
    path('categories/', views.categories, name='categories'),
    path('low-stock/', views.low_stock_products, name='low_stock'),
]
