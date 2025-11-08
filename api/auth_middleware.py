import os
import jwt
from functools import wraps
from flask import request, jsonify, g
from keycloak import KeycloakOpenID

KEYCLOAK_SERVER_URL = os.getenv('KEYCLOAK_SERVER_URL', 'https://auth-dev.snowse.io')
KEYCLOAK_REALM = os.getenv('KEYCLOAK_REALM', 'DevRealm')
KEYCLOAK_CLIENT_ID = os.getenv('KEYCLOAK_CLIENT_ID', 'logan-chat')
KEYCLOAK_CLIENT_SECRET = os.getenv('KEYCLOAK_CLIENT_SECRET', '')  # Optional for public clients

keycloak_openid = KeycloakOpenID(
    server_url=KEYCLOAK_SERVER_URL,
    client_id=KEYCLOAK_CLIENT_ID,
    realm_name=KEYCLOAK_REALM,
    client_secret_key=KEYCLOAK_CLIENT_SECRET if KEYCLOAK_CLIENT_SECRET else None
)

PUBLIC_ROUTES = [
]

def get_token_from_header():
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        return None
    
    parts = auth_header.split()
    
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        return None
    
    return parts[1]

def validate_token(token):
    try:
        public_key = (
            "-----BEGIN PUBLIC KEY-----\n"
            + keycloak_openid.public_key()
            + "\n-----END PUBLIC KEY-----"
        )
        
        options = {
            "verify_signature": True,
            "verify_aud": False,  # Set to True if you want to verify audience
            "verify_exp": True,
        }
        
        decoded_token = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options=options,
            audience=KEYCLOAK_CLIENT_ID if KEYCLOAK_CLIENT_SECRET else None
        )
        
        return decoded_token
    
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    except Exception as e:
        print(f"Token validation error: {str(e)}")
        return None

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_token_from_header()
        
        if not token:
            return jsonify({'error': 'No authorization token provided'}), 401
        
        decoded_token = validate_token(token)
        
        if not decoded_token:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        g.user = {
            'sub': decoded_token.get('sub'),
            'email': decoded_token.get('email'),
            'preferred_username': decoded_token.get('preferred_username'),
            'roles': decoded_token.get('realm_access', {}).get('roles', []),
            'token': decoded_token
        }
        
        return f(*args, **kwargs)
    
    return decorated_function

def init_auth_middleware(app):
    
    @app.before_request
    def check_authentication():
        
        if request.path in PUBLIC_ROUTES:
            return None
        
        if request.method == 'OPTIONS':
            return None
        
        token = get_token_from_header()
        
        if not token:
            return jsonify({'error': 'No authorization token provided'}), 401
        
        decoded_token = validate_token(token)
        
        if not decoded_token:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        g.user = {
            'sub': decoded_token.get('sub'),
            'email': decoded_token.get('email'),
            'preferred_username': decoded_token.get('preferred_username'),
            'roles': decoded_token.get('realm_access', {}).get('roles', []),
            'token': decoded_token
        }
        
        return None
