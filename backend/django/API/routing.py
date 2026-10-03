from django.urls import path
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/notifications/(?P<user_id>\d+)/$', consumers.NotificationConsumer.as_asgi()),
]
#depuis front:
#ws://<TON_DOMAINE>/ws/chat/
#{
#   "content": "Salut, combien coûte ce produit ?"
#   "receiver_id" : id,
#   "product_id" : id   (optionnel)
# }
#ws://<TON_DOMAINE>/ws/notifications/<userID>/