"""
Spotify Integration Service for MindAI
======================================
Invisible Mood Tracking via Spotify Listening History
Music Recommendations based on detected mood

Features:
1. OAuth authentication with Spotify
2. Fetch recently played tracks
3. Extract valence (positivity) and energy from audio features
4. Calculate Musical Mood Score (0-100)
5. Generate mood-based music recommendations
"""

import os
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from datetime import datetime, timedelta
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

# Spotify API Configuration
SPOTIPY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID', 'your_client_id_here')
SPOTIPY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET', 'your_client_secret_here')
SPOTIPY_REDIRECT_URI = os.getenv('SPOTIFY_REDIRECT_URI', 'http://localhost:8000/spotify/callback')

# Mood-based playlists (Spotify playlist IDs for different moods)
# These are popular mood playlists - replace with your own for better recommendations
MOOD_PLAYLISTS = {
    'happy': {
        'spotify_playlist': '37i9dQZF1DXdPec7aLTmlC',  # Happy Hits!
        'hindi_playlist': '37i9dQZF1DX0XUsuxWHRQd',  # Hindi Hits
        'description': 'Upbeat and positive songs to match your mood!'
    },
    'sad': {
        'spotify_playlist': '37i9dQZF1DX3YSRoSdA634',  # Sad Songs
        'hindi_playlist': '37i9dQZF1DWWEJlAGA9gs0',  # Hindi Sad Songs
        'description': 'Let these songs help you process your emotions'
    },
    'energetic': {
        'spotify_playlist': '37i9dQZF1DX0pH2SQMRXnC',  # Power Hits
        'hindi_playlist': '37i9dQZF1DX2sUQwD7tbmL',  # Bollywood Workouts
        'description': 'High-energy tracks to keep you moving!'
    },
    'calm': {
        'spotify_playlist': '37i9dQZF1DX4sWSpwq3LiO',  # Peaceful Piano
        'hindi_playlist': '37i9dQZF1DWWEJlAGA9gs0',  # Peaceful Hindi
        'description': 'Calming melodies to help you relax'
    },
    'angry': {
        'spotify_playlist': '37i9dQZF1DX4dyzvuaRJ0n',  # Rage Beats
        'hindi_playlist': '37i9dQZF1DX0pH2SQMRXnC',  # High Energy Hindi
        'description': 'Let the music help you release tension'
    },
    'anxious': {
        'spotify_playlist': '37i9dQZF1DX4sWSpwq3LiO',  # Peaceful Piano
        'hindi_playlist': '37i9dQZF1DWWEJlAGA9gs0',  # Calm Hindi
        'description': 'Soothing music to ease your mind'
    },
    'neutral': {
        'spotify_playlist': '37i9dQZF1DX4E3UdUs7fUx',  # Today's Top Hits
        'hindi_playlist': '37i9dQZF1DX2DBE3Ud7fUx',  # Today's Top Hits Hindi
        'description': 'Great music for any mood'
    }
}


class SpotifyService:
    """
    Main Spotify service class for mood tracking and music recommendations.
    """
    
    def __init__(self, access_token=None, refresh_token=None):
        """
        Initialize Spotify service with user tokens.
        
        Args:
            access_token: Spotify access token for API calls
            refresh_token: Spotify refresh token for token refresh
        """
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.sp = None
        
        if access_token:
            self.sp = spotipy.Spotify(auth=access_token)
    
    @staticmethod
    def get_auth_url():
        """
        Generate Spotify OAuth URL for user authorization.
        
        Returns:
            str: URL for user to authorize the app
        """
        scope = 'user-read-recently-played user-top-read playlist-read-private'
        auth_manager = SpotifyOAuth(
            client_id=SPOTIPY_CLIENT_ID,
            client_secret=SPOTIPY_CLIENT_SECRET,
            redirect_uri=SPOTIPY_REDIRECT_URI,
            scope=scope
        )
        return auth_manager.get_authorize_url()
    
    @staticmethod
    def get_tokens_from_code(code):
        """
        Exchange authorization code for access and refresh tokens.
        
        Args:
            code: Authorization code from Spotify OAuth callback
            
        Returns:
            dict: Contains access_token, refresh_token, expires_in
        """
        auth_manager = SpotifyOAuth(
            client_id=SPOTIPY_CLIENT_ID,
            client_secret=SPOTIPY_CLIENT_SECRET,
            redirect_uri=SPOTIPY_REDIRECT_URI
        )
        token_info = auth_manager.get_access_token(code)
        return token_info
    
    def refresh_access_token(self):
        """
        Refresh the Spotify access token using refresh token.
        
        Returns:
            str: New access token or None if refresh failed
        """
        if not self.refresh_token:
            return None
            
        try:
            auth_manager = SpotifyOAuth(
                client_id=SPOTIPY_CLIENT_ID,
                client_secret=SPOTIPY_CLIENT_SECRET,
                redirect_uri=SPOTIPY_REDIRECT_URI
            )
            token_info = auth_manager.refresh_token(self.refresh_token)
            self.access_token = token_info['access_token']
            self.sp = spotipy.Spotify(auth=self.access_token)
            return self.access_token
        except Exception as e:
            logger.error(f"Failed to refresh Spotify token: {e}")
            return None
    
    def get_recently_played(self, limit=20):
        """
        Fetch the user's recently played tracks.
        
        Args:
            limit: Number of tracks to fetch (max 50)
            
        Returns:
            list: List of recently played track dictionaries
        """
        if not self.sp:
            return []
        
        try:
            results = self.sp.current_user_recently_played(limit=limit)
            tracks = []
            
            for item in results['items']:
                track = item['track']
                tracks.append({
                    'id': track['id'],
                    'name': track['name'],
                    'artist': ', '.join([artist['name'] for artist in track['artists']]),
                    'album': track['album']['name'],
                    'played_at': item['played_at'],
                    'spotify_url': track['external_urls']['spotify'],
                    'album_art': track['album']['images'][0]['url'] if track['album']['images'] else None
                })
            
            return tracks
        except spotipy.exceptions.SpotifyException as e:
            logger.error(f"Spotify API error: {e}")
            if e.http_status == 401:  # Token expired
                self.refresh_access_token()
            return []
        except Exception as e:
            logger.error(f"Error fetching recently played: {e}")
            return []
    
    def get_audio_features(self, track_ids):
        """
        Get audio features for a list of track IDs.
        
        Spotify Audio Features include:
        - valence: Musical positiveness (0.0 = sad/angry, 1.0 = happy/cheerful)
        - energy: Intensity and activity (0.0 = calm/slow, 1.0 = fast/loud)
        - danceability: How suitable for dancing
        - tempo: Speed in BPM
        - acousticness: Likelihood of being acoustic
        - instrumentalness: Likelihood of containing no vocals
        
        Args:
            track_ids: List of Spotify track IDs
            
        Returns:
            list: List of audio feature dictionaries
        """
        if not self.sp or not track_ids:
            return []
        
        try:
            # Spotify API accepts max 100 track IDs
            features = self.sp.audio_features(track_ids[:100])
            return [f for f in features if f is not None]
        except Exception as e:
            logger.error(f"Error fetching audio features: {e}")
            return []
    
    def calculate_musical_mood_score(self, tracks_limit=20):
        """
        Calculate the Musical Mood Score based on recently played tracks.
        
        Algorithm:
        1. Fetch recently played tracks
        2. Get audio features for each track
        3. Calculate weighted average of valence and energy
        4. Map to mood score (0-100)
        
        Musical Mood Score Calculation:
        - Valence: How positive/happy the music sounds
        - Energy: How fast/intense the music is
        - Combined: (valence * 0.6 + energy * 0.4) * 100
        
        Args:
            tracks_limit: Number of recent tracks to analyze
            
        Returns:
            dict: Contains mood_score, valence, energy, detected_mood, tracks
        """
        # Fetch recent tracks
        recent_tracks = self.get_recently_played(tracks_limit)
        
        if not recent_tracks:
            return {
                'mood_score': 50,
                'valence': 0.5,
                'energy': 0.5,
                'detected_mood': 'neutral',
                'tracks': [],
                'message': 'No recent tracks found'
            }
        
        # Get track IDs for audio features
        track_ids = [t['id'] for t in recent_tracks]
        audio_features = self.get_audio_features(track_ids)
        
        if not audio_features:
            return {
                'mood_score': 50,
                'valence': 0.5,
                'energy': 0.5,
                'detected_mood': 'neutral',
                'tracks': recent_tracks,
                'message': 'Could not fetch audio features'
            }
        
        # Calculate averages (more recent tracks weighted higher)
        total_valence = 0
        total_energy = 0
        total_danceability = 0
        
        for i, features in enumerate(audio_features):
            # Weight: more recent = higher weight
            weight = (i + 1) / len(audio_features)
            
            total_valence += features.get('valence', 0.5) * weight
            total_energy += features.get('energy', 0.5) * weight
            total_danceability += features.get('danceability', 0.5) * weight
        
        avg_valence = total_valence / sum(range(1, len(audio_features) + 1)) * len(audio_features)
        avg_energy = total_energy / sum(range(1, len(audio_features) + 1)) * len(audio_features)
        avg_danceability = total_danceability / sum(range(1, len(audio_features) + 1)) * len(audio_features)
        
        # Calculate mood score (0-100)
        # Formula: valence contributes 60%, energy contributes 40%
        mood_score = int((avg_valence * 0.6 + avg_energy * 0.4) * 100)
        
        # Detect mood category
        detected_mood = self._detect_mood_category(avg_valence, avg_energy)
        
        return {
            'mood_score': mood_score,
            'valence': round(avg_valence, 3),
            'energy': round(avg_energy, 3),
            'danceability': round(avg_danceability, 3),
            'detected_mood': detected_mood,
            'tracks': recent_tracks[:10],  # Return top 10 for display
            'message': f'Based on {len(recent_tracks)} recently played tracks'
        }
    
    def _detect_mood_category(self, valence, energy):
        """
        Detect mood category based on valence and energy.
        
        Args:
            valence: Audio valence (0-1)
            energy: Audio energy (0-1)
            
        Returns:
            str: Mood category
        """
        if valence >= 0.6 and energy >= 0.6:
            return 'happy'
        elif valence >= 0.6 and energy < 0.4:
            return 'calm'
        elif valence < 0.4 and energy >= 0.6:
            return 'angry'
        elif valence < 0.4 and energy < 0.4:
            return 'sad'
        elif valence >= 0.5 and energy >= 0.7:
            return 'energetic'
        elif valence < 0.4:
            return 'anxious'
        else:
            return 'neutral'
    
    def get_mood_recommendations(self, detected_mood=None, mood_score=None):
        """
        Get music recommendations based on detected mood.
        
        If mood is provided, use it. Otherwise calculate from recent tracks.
        
        Args:
            detected_mood: Override detected mood
            mood_score: Override calculated mood score
            
        Returns:
            dict: Contains playlist URLs, track recommendations for each mood
        """
        # If no mood provided, calculate from recent tracks
        if detected_mood is None:
            mood_data = self.calculate_musical_mood_score()
            detected_mood = mood_data.get('detected_mood', 'neutral')
            mood_score = mood_data.get('mood_score', 50)
        
        # Get mood-specific playlist
        mood_playlists = MOOD_PLAYLISTS.get(detected_mood, MOOD_PLAYLISTS['neutral'])
        
        recommendations = {
            'current_mood': detected_mood,
            'mood_score': mood_score,
            'spotify_playlist': mood_playlists['spotify_playlist'],
            'hindi_playlist': mood_playlists['hindi_playlist'],
            'description': mood_playlists['description'],
            'playlist_urls': {
                'spotify': f"https://open.spotify.com/playlist/{mood_playlists['spotify_playlist']}",
                'hindi': f"https://open.spotify.com/playlist/{mood_playlists['hindi_playlist']}"
            },
            'all_moods': {}
        }
        
        # Include playlists for all moods (for browsing)
        for mood, data in MOOD_PLAYLISTS.items():
            recommendations['all_moods'][mood] = {
                'description': data['description'],
                'url': f"https://open.spotify.com/playlist/{data['spotify_playlist']}"
            }
        
        return recommendations
    
    def analyze_and_recommend(self):
        """
        Full analysis: get mood from music + recommend playlists.
        
        Returns:
            dict: Complete mood analysis and recommendations
        """
        # Step 1: Calculate mood from listening history
        mood_analysis = self.calculate_musical_mood_score()
        
        # Step 2: Get recommendations
        recommendations = self.get_mood_recommendations(
            detected_mood=mood_analysis.get('detected_mood'),
            mood_score=mood_analysis.get('mood_score')
        )
        
        # Combine results
        return {
            **mood_analysis,
            'recommendations': recommendations
        }


# Celery Task for Background Processing
def calculate_musical_mood_task(user_id, access_token, refresh_token):
    """
    Celery task to calculate musical mood in background.
    
    This can be scheduled to run periodically (e.g., every hour)
    to passively track user's mood based on their music.
    
    Args:
        user_id: Django user ID
        access_token: Spotify access token
        refresh_token: Spotify refresh token
        
    Returns:
        dict: Mood analysis results
    """
    from mood_engine.models import DailyLog
    from users.models import CustomUser
    
    try:
        # Initialize Spotify service
        spotify_service = SpotifyService(access_token, refresh_token)
        
        # Get mood analysis
        result = spotify_service.analyze_and_recommend()
        
        # Save to database
        user = CustomUser.objects.get(id=user_id)
        
        # Create or update daily log with musical mood
        today = datetime.now().date()
        log, created = DailyLog.objects.get_or_create(
            user=user,
            date=today,
            defaults={'mood_score': result['mood_score']}
        )
        
        if not created:
            # Average with existing score if already exists
            log.mood_score = (log.mood_score + result['mood_score']) // 2
            log.save()
        
        # Store musical mood data in journal or custom field
        if log.journal_entry:
            log.journal_entry += f"\n\n[Musical Mood: {result['detected_mood']} - {result['valence']:.2f} valence, {result['energy']:.2f} energy]"
        else:
            log.journal_entry = f"[Musical Mood: {result['detected_mood']} - {result['valence']:.2f} valence, {result['energy']:.2f} energy]"
        log.save()
        
        logger.info(f"Musical mood calculated for user {user_id}: {result['detected_mood']}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error in calculate_musical_mood_task: {e}")
        return {'error': str(e)}


# Example Celery Task Definition
"""
from celery import shared_task

@shared_task
def refresh_and_analyze_spotify(user_id):
    '''Background task to refresh token and analyze mood.'''
    from users.models import CustomUser
    
    try:
        user = CustomUser.objects.get(id=user_id)
        tokens = user.spotify_tokens  # Assuming you have this field
        
        spotify_service = SpotifyService(
            access_token=tokens.access_token,
            refresh_token=tokens.refresh_token
        )
        
        # If token expired, refresh first
        spotify_service.refresh_access_token()
        
        return calculate_musical_mood_task(user_id, spotify_service.access_token, spotify_service.refresh_token)
    except Exception as e:
        return {'error': str(e)}
"""
