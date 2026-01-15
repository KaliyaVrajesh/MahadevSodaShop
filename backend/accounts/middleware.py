"""Supabase Auth Middleware for Django."""
import jwt
from django.conf import settings


class SupabaseAuthMiddleware:
    """Middleware to attach Supabase user info to request."""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                payload = jwt.decode(
                    token,
                    options={"verify_signature": False},
                    algorithms=['HS256']
                )
                request.supabase_user = payload
                request.supabase_user_id = payload.get('sub')
                request.supabase_email = payload.get('email')
            except jwt.InvalidTokenError:
                request.supabase_user = None
                request.supabase_user_id = None
        else:
            request.supabase_user = None
            request.supabase_user_id = None
        
        response = self.get_response(request)
        return response
