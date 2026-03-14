"""
Spotify API Views for MindAI
============================
Django REST Framework views for Spotify integration
"""

import os
from django.http import JsonResponse, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .services import SpotifyService, calculate_musical_mood_task


def spotify_login(request):
    """
    Redirect user to Spotify OAuth authorization page.
    
    URL: /spotify/login/
    """
    auth_url = SpotifyService.get_auth_url()
    return HttpResponseRedirect(auth_url)


def spotify_callback(request):
    """
    Handle Spotify OAuth callback.
    
    URL: /spotify/callback/
    
    Query params:
        - code: Authorization code from Spotify
        - error: Error message if authorization failed
    """
    code = request.GET.get('code')
    error = request.GET.get('error')
    
    if error:
        return JsonResponse({'error': error}, status=400)
    
    if not code:
        return JsonResponse({'error': 'No authorization code received'}, status=400)
    
    try:
        # Exchange code for tokens
        token_info = SpotifyService.get_tokens_from_code(code)
        
        # In a real app, save these tokens to the user's profile
        # For now, return them to be stored in frontend/localStorage
        
        # Redirect to frontend with tokens
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        redirect_url = f"{frontend_url}/spotify/connected?access_token={token_info['access_token']}&refresh_token={token_info['refresh_token']}"
        
        return HttpResponseRedirect(redirect_url)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_music_mood(request):
    """
    Analyze user's recently played music to detect mood.
    
    URL: POST /spotify/analyze/
    
    Headers:
        Authorization: Bearer <access_token>
    
    Body (JSON):
        {
            "access_token": "spotify_access_token",
            "refresh_token": "spotify_refresh_token"  // optional
        }
    
    Returns:
        {
            "mood_score": 75,
            "valence": 0.75,
            "energy": 0.68,
            "detected_mood": "happy",
            "tracks": [...],
            "message": "Based on 20 recently played tracks"
        }
    """
    access_token = request.data.get('access_token')
    refresh_token = request.data.get('refresh_token')
    
    if not access_token:
        return Response({'error': 'Access token required'}, status=400)
    
    try:
        spotify_service = SpotifyService(access_token, refresh_token)
        result = spotify_service.calculate_musical_mood_score()
        
        return Response(result)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_music_recommendations(request):
    """
    Get mood-based music recommendations.
    
    URL: POST /spotify/recommend/
    
    Body (JSON):
        {
            "access_token": "spotify_access_token",
            "mood": "sad"  // optional - if not provided, will analyze recent tracks
        }
    
    Returns:
        {
            "current_mood": "sad",
            "mood_score": 35,
            "spotify_playlist": "37i9dQZF1DX3YSRoSdA634",
            "hindi_playlist": "37i9dQZF1DWWEJlAGA9gs0",
            "playlist_urls": {...},
            "description": "Let these songs help you process your emotions"
        }
    """
    access_token = request.data.get('access_token')
    refresh_token = request.data.get('refresh_token')
    detected_mood = request.data.get('mood')
    mood_score = request.data.get('mood_score')
    
    if not access_token:
        return Response({'error': 'Access token required'}, status=400)
    
    try:
        spotify_service = SpotifyService(access_token, refresh_token)
        result = spotify_service.get_mood_recommendations(detected_mood, mood_score)
        
        return Response(result)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_mood_playlists(request):
    """
    Get all available mood playlists.
    
    URL: GET /spotify/playlists/
    
    Returns:
        {
            "happy": {
                "description": "Upbeat and positive songs",
                "url": "https://open.spotify.com/playlist/..."
            },
            "sad": {...},
            ...
        }
    """
    from .services import MOOD_PLAYLISTS
    
    playlists = {}
    for mood, data in MOOD_PLAYLISTS.items():
        playlist_id = data['spotify_playlist']
        playlists[mood] = {
            'description': data['description'],
            'spotify_playlist': playlist_id,
            'url': f"https://open.spotify.com/playlist/{playlist_id}",
            'embed_url': f"https://open.spotify.com/embed/playlist/{playlist_id}?utm_source=generator&theme=0",
            'hindi_url': f"https://open.spotify.com/playlist/{data['hindi_playlist']}",
            'hindi_embed_url': f"https://open.spotify.com/embed/playlist/{data['hindi_playlist']}?utm_source=generator&theme=0"
        }
    
    return Response(playlists)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def full_music_analysis(request):
    """
    Complete music mood analysis and recommendations in one call.
    
    URL: POST /spotify/full-analysis/
    
    Body (JSON):
        {
            "access_token": "spotify_access_token",
            "refresh_token": "spotify_refresh_token"  // optional
        }
    
    Returns complete analysis including mood score and playlist recommendations.
    """
    access_token = request.data.get('access_token')
    refresh_token = request.data.get('refresh_token')
    
    if not access_token:
        return Response({'error': 'Access token required'}, status=400)
    
    try:
        spotify_service = SpotifyService(access_token, refresh_token)
        result = spotify_service.analyze_and_recommend()
        
        return Response(result)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_spotify_token(request):
    """
    Save user's Spotify access token for Web Playback SDK.
    
    URL: POST /spotify/save-token/
    
    Body (JSON):
        {
            "access_token": "spotify_access_token",
            "refresh_token": "spotify_refresh_token"  // optional
        }
    
    Returns: { "success": true }
    """
    access_token = request.data.get('access_token')
    refresh_token = request.data.get('refresh_token')
    
    if not access_token:
        return Response({'error': 'Access token required'}, status=400)
    
    try:
        # Store tokens in user profile or session
        # For now, we'll use Django's cache or simple storage
        from django.core.cache import cache
        user_id = request.user.id
        cache.set(f'spotify_access_token_{user_id}', access_token, timeout=3600)  # 1 hour
        if refresh_token:
            cache.set(f'spotify_refresh_token_{user_id}', refresh_token, timeout=30*24*3600)  # 30 days
        
        return Response({'success': True, 'message': 'Token saved successfully'})
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_spotify_token(request):
    """
    Get user's Spotify access token for Web Playback SDK.
    
    URL: GET /spotify/get-token/
    
    Returns: { "access_token": "..." } or { "error": "No token found" }
    """
    try:
        from django.core.cache import cache
        user_id = request.user.id
        access_token = cache.get(f'spotify_access_token_{user_id}')
        
        if not access_token:
            return Response({'error': 'No Spotify token found. Please connect your Spotify account.'}, status=404)
        
        return Response({'access_token': access_token})
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)
