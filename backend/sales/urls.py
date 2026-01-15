from django.urls import path
from . import views

urlpatterns = [
    path('', views.sale_list, name='sale_list'),
    path('create/', views.create_sale, name='create_sale'),
    path('bulk/', views.bulk_sale, name='bulk_sale'),
    path('dashboard/', views.dashboard_stats, name='dashboard_stats'),
    path('best-sellers/', views.best_sellers, name='best_sellers'),
    path('daily-trend/', views.daily_sales_trend, name='daily_trend'),
    path('profit-loss/', views.profit_loss_report, name='profit_loss'),
]
