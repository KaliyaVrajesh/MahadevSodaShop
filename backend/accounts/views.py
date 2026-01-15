"""Account views for user profile management."""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import connection


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """Get current user's profile."""
    user_id = getattr(request.user, 'id', None)
    
    if not user_id:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, username, email, role, created_at 
                FROM profiles WHERE id = %s
                """,
                [user_id]
            )
            row = cursor.fetchone()
            
            if row:
                return Response({
                    'id': str(row[0]),
                    'username': row[1],
                    'email': row[2],
                    'role': row[3],
                    'created_at': row[4].isoformat() if row[4] else None
                })
            else:
                return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_admin(request):
    """Check if current user is admin."""
    user_id = getattr(request.user, 'id', None)
    
    if not user_id:
        return Response({'is_admin': False})
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT role FROM profiles WHERE id = %s",
                [user_id]
            )
            row = cursor.fetchone()
            is_admin = row and row[0] == 'admin'
            return Response({'is_admin': is_admin})
    except Exception:
        return Response({'is_admin': False})
