"""Custom permissions for Mahadav Soda Shop."""
from rest_framework import permissions
from django.db import connection


class IsAdminUser(permissions.BasePermission):
    """Permission check for admin users."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user is admin in profiles table
        user_id = getattr(request.user, 'id', None)
        if not user_id:
            return False
        
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT role FROM profiles WHERE id = %s",
                    [user_id]
                )
                row = cursor.fetchone()
                return row and row[0] == 'admin'
        except Exception:
            return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow read for all authenticated, write only for admin."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check admin for write operations
        user_id = getattr(request.user, 'id', None)
        if not user_id:
            return False
        
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT role FROM profiles WHERE id = %s",
                    [user_id]
                )
                row = cursor.fetchone()
                return row and row[0] == 'admin'
        except Exception:
            return False
