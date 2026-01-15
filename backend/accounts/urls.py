from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.get_profile, name='get_profile'),
    path('check-admin/', views.check_admin, name='check_admin'),
]
