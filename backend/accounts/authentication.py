"""Supabase JWT Authentication for Django REST Framework."""
import jwt
from django.conf import settings
from rest_framework import authentication, exceptions


class SupabaseUser:
    """Custom user object for Supabase authenticated requests."""
    
    def __init__(self, payload):
        self.id = payload.get('sub')
        self.pk = self.id  # Required for DRF throttling
        self.email = payload.get('email')
        self.role = payload.get('role', 'authenticated')
        self.user_metadata = payload.get('user_metadata', {})
        self.is_authenticated = True
        self.is_active = True
        self.is_anonymous = False
    
    def __str__(self):
        return self.email or self.id


class SupabaseAuthentication(authentication.BaseAuthentication):
    """Authenticate requests using Supabase JWT tokens."""
    
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        
        try:
            # Decode JWT without verification for development
            # In production, verify with SUPABASE_JWT_SECRET
            payload = jwt.decode(
                token,
                options={"verify_signature": False},
                algorithms=['HS256']
            )
            
            user = SupabaseUser(payload)
            return (user, token)
            
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError as e:
            raise exceptions.AuthenticationFailed(f'Invalid token: {str(e)}')
    
    def authenticate_header(self, request):
        return 'Bearer'
