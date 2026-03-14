from django.urls import re_path
from .consumers import AICompanionConsumer

websocket_urlpatterns = [
    re_path(r'ws/ai/$', AICompanionConsumer.as_asgi()),
]
