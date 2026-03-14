"""
Spotify Service URL Configuration
"""

from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.spotify_login, name='spotify_login'),
    path('callback/', views.spotify_callback, name='spotify_callback'),
    path('analyze/', views.analyze_music_mood, name='analyze_music_mood'),
    path('recommend/', views.get_music_recommendations, name='get_music_recommendations'),
    path('playlists/', views.get_mood_playlists, name='get_mood_playlists'),
    path('full-analysis/', views.full_music_analysis, name='full_music_analysis'),
    path('save-token/', views.save_spotify_token, name='save_spotify_token'),
    path('get-token/', views.get_spotify_token, name='get_spotify_token'),
]
