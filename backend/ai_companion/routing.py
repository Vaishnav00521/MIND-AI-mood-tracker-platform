from django.urls import re_path
from .consumers import AICompanionConsumer

websocket_urlpatterns = [
    re_path(r'ws/chat/companion/$', AICompanionConsumer.as_asgi()),
]
