import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Message, Notification, Products, User, create_notification
from django.contrib.auth import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
# from .userViews import send_realtime_notification
from channels.layers import get_channel_layer
from urllib.parse import parse_qs
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.authentication import JWTAuthentication

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Vérifier si l'utilisateur est authentifié
        if not self.scope["user"].is_authenticated:
            await self.close()
            return
        # self.product_id = self.scope['url_route']['kwargs']['product_id']
        self.user = self.scope['user']
        self.room_group_name = f"user_chat_{self.user.id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        print(self.room_group_name)
        await self.send(text_data=json.dumps({
            "type": "connection",
            "fullname": self.user.fullname,
        }))

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        if not self.user.is_authenticated:
            await self.send(text_data=json.dumps({
                "error": "Authentication required to send messages."
            }))
            return

        try:
            print(text_data)
            data = json.loads(text_data)
            receiver_id = data.get('receiver_id')
            content = data.get('content')
            product_id = data.get('product')

            if not receiver_id or not content:
                raise ValueError("Missing receiver_id or content.")

            receiver = await self.get_user(receiver_id)
            if not receiver:
                raise ValueError("Receiver not found.")
 
            product = await self.get_product(product_id) if product_id else None
            message = await self.save_message(self.user, receiver, product, content)
            await self.save_notification(receiver, content)
            await self.send_realtime_notification(content, receiver)
            
            await self.channel_layer.group_send(
                f"user_chat_{receiver.id}",
                {
                    'type': 'chat_message',
                    'sender': self.user.fullname,
                    'receiver': receiver.fullname,
                    'content': content,
                    'timestamp': str(message.timestamp),
                    "product": product.id if product else None
                }
            )
        except Exception as e:
            await self.send(text_data=json.dumps({
                "error": str(e)
            }))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    async def send_realtime_notification(self, message, receiver):
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            f"user_{receiver.id}", 
            {
            "type": "send_notification",
            "message": message
            }
        )
 
    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def get_product(self, product_id):
        try:
            return Products.objects.get(id=product_id)
        except Products.DoesNotExist:
            return None

    @database_sync_to_async
    def save_message(self, sender, receiver, product, content):
        return Message.objects.create(
            sender=sender,
            receiver=receiver,
            product=product,
            content=content
        )
    
    @database_sync_to_async
    def save_notification(self, receiver, content):
        return create_notification(receiver, content)
    
#-----------------------------------------------------------------------------------------
class NotificationConsumer(AsyncWebsocketConsumer):
    #log console
    print("we entered Notification Consumer")
    async def connect(self):
        # Récupère le token dans les query params
        query_string = self.scope['query_string'].decode()
        token = parse_qs(query_string).get('token', [None])[0]

        self.user = None
        if token:
            try:
                validated_token = UntypedToken(token)
                jwt_auth = JWTAuthentication()
                user = await database_sync_to_async(jwt_auth.get_user)(validated_token)
                self.user = await database_sync_to_async(User.objects.get)(id=user.id)
            except Exception as e:
                await self.close()
                return

        # Refuser la connexion si l'utilisateur n'est pas authentifié
        if not self.user:
            await self.close()
            return

        print(f'{self.user} is connected hhhhhh ')
        self.group_name = f"user_{self.user.id}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
        )

    # Méthode appelée lorsqu'une notification est envoyée
    async def send_notification(self, event):
        #log console
        print("we entred send notification function")
        message = event.get('message', '')
        await self.send(text_data=json.dumps({
            'notification': message
        }))