from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from django.db import close_old_connections
import jwt
from django.conf import settings

User = get_user_model()

@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Extraire le token JWT de la query string ou des headers
        query_string = parse_qs(scope["query_string"].decode())
        token = None

        if "token" in query_string:
            token = query_string["token"][0]
        elif "headers" in scope:
            for header in scope["headers"]:
                if header[0] == b'authorization':
                    auth_header = header[1].decode()
                    if auth_header.startswith("Bearer "):
                        token = auth_header.split(" ")[1]
                    break

        # Vérification du token
        if token is not None:
            try:
                # Décode le token
                decoded_data = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                user = await get_user(decoded_data["user_id"])
                scope["user"] = user
            except (InvalidToken, TokenError, jwt.DecodeError):
                scope["user"] = AnonymousUser()
        else:
            scope["user"] = AnonymousUser()

        close_old_connections()
        return await super().__call__(scope, receive, send)
