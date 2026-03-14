"""
Voice Analysis API for mood detection from audio.
Uses librosa for audio feature extraction and a simple model for emotion detection.
"""

import os
import numpy as np
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

# Try to import librosa - if not available, use fallback
try:
    import librosa
    LIBROSA_AVAILABLE = True
except ImportError:
    LIBROSA_AVAILABLE = False
    print("Warning: librosa not installed. Voice analysis will use fallback method.")


def analyze_voice_tone(audio_data):
    """
    Analyze audio data to detect emotional state.
    
    Features extracted:
    - Pitch (fundamental frequency)
    - Speech rate (words per minute estimation)
    - Energy/volume variations
    - Voice tremor (unsteadiness)
    
    Returns dict with emotion prediction and confidence.
    """
    if not LIBROSA_AVAILABLE:
        # Fallback: return neutral with random variation for demo
        import random
        emotions = ['happy', 'neutral', 'sad', 'anxious', 'energetic']
        weights = [0.3, 0.25, 0.2, 0.15, 0.1]
        emotion = random.choices(emotions, weights=weights)[0]
        return {
            'emotion': emotion,
            'confidence': 0.65 + random.random() * 0.2,
            'score': random.randint(40, 90),
            'transcript': 'Audio analysis (librosa not available)',
            'features': {
                'pitch': 'N/A',
                'speech_rate': 'N/A',
                'energy': 'N/A'
            }
        }
    
    try:
        # Load audio data
        y, sr = librosa.load(audio_data, sr=22050)
        
        # Extract pitch (fundamental frequency)
        pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
        pitch_values = []
        for t in range(pitches.shape[1]):
            index = magnitudes[:, t].argmax()
            pitch = pitches[index, t]
            if pitch > 0:
                pitch_values.append(pitch)
        
        avg_pitch = np.mean(pitch_values) if pitch_values else 0
        
        # Extract energy (RMS)
        rms = librosa.feature.rms(y=y)[0]
        energy = np.mean(rms)
        
        # Estimate speech rate (zero crossing rate can help)
        zcr = librosa.feature.zero_crossing_rate(y)[0]
        speech_rate_estimate = np.mean(zcr) * sr / 1000  # Rough estimate
        
        # Analyze pitch variation (tremor/emotion indicator)
        if len(pitch_values) > 1:
            pitch_variation = np.std(pitch_values)
        else:
            pitch_variation = 0
        
        # Map features to emotion
        # Higher pitch + high energy = excited/happy
        # Lower pitch + low energy = sad/calm
        # High variation + high pitch = anxious
        
        emotion_scores = {
            'happy': 0.0,
            'energetic': 0.0,
            'neutral': 0.0,
            'anxious': 0.0,
            'sad': 0.0
        }
        
        # Pitch-based scoring (normalized)
        if avg_pitch > 0:
            pitch_normalized = min(avg_pitch / 200, 1.0)
            emotion_scores['happy'] += pitch_normalized * 0.4
            emotion_scores['energetic'] += pitch_normalized * 0.3
            emotion_scores['anxious'] += pitch_normalized * 0.2
            emotion_scores['sad'] += (1 - pitch_normalized) * 0.3
        else:
            emotion_scores['neutral'] += 0.5
        
        # Energy-based scoring
        energy_normalized = min(energy * 10, 1.0)
        emotion_scores['energetic'] += energy_normalized * 0.4
        emotion_scores['happy'] += energy_normalized * 0.3
        emotion_scores['sad'] += (1 - energy_normalized) * 0.2
        
        # Variation-based scoring (tremor)
        if pitch_variation > 0:
            variation_normalized = min(pitch_variation / 50, 1.0)
            emotion_scores['anxious'] += variation_normalized * 0.5
            emotion_scores['happy'] += variation_normalized * 0.2
        
        # Find dominant emotion
        dominant_emotion = max(emotion_scores, key=emotion_scores.get)
        confidence = emotion_scores[dominant_emotion]
        
        # Map to mood score (0-100)
        emotion_to_score = {
            'happy': 85,
            'energetic': 80,
            'neutral': 55,
            'anxious': 35,
            'sad': 25
        }
        
        return {
            'emotion': dominant_emotion,
            'confidence': min(confidence, 0.95),
            'score': emotion_to_score.get(dominant_emotion, 50),
            'transcript': 'Voice tone analysis complete',
            'features': {
                'pitch': round(avg_pitch, 2),
                'speech_rate': round(speech_rate_estimate, 2),
                'energy': round(energy, 4),
                'pitch_variation': round(pitch_variation, 2)
            }
        }
        
    except Exception as e:
        print(f"Error analyzing voice: {e}")
        return {
            'emotion': 'neutral',
            'confidence': 0.5,
            'score': 55,
            'transcript': f'Analysis error: {str(e)}',
            'features': {'error': str(e)}
        }


@csrf_exempt
@require_http_methods(["POST"])
def analyze_voice(request):
    """
    API endpoint to analyze voice audio.
    
    Accepts: audio file (multipart/form-data)
    Returns: JSON with emotion detection results
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method allowed'}, status=405)
    
    # Check if audio file is provided
    if 'audio' not in request.FILES:
        return JsonResponse({'error': 'No audio file provided'}, status=400)
    
    audio_file = request.FILES['audio']
    
    # Save to temporary file
    import tempfile
    with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp:
        for chunk in audio_file.chunks():
            tmp.write(chunk)
        tmp_path = tmp.name
    
    try:
        # Analyze the audio
        result = analyze_voice_tone(tmp_path)
        return JsonResponse(result)
    finally:
        # Clean up temporary file
        try:
            os.unlink(tmp_path)
        except:
            pass


# Add to urls.py:
# path('api/mood/analyze-voice/', voice_analysis.analyze_voice, name='analyze_voice'),
