"""
Digital Twin API Views
"""

import os
from datetime import datetime, timedelta
from django.http import JsonResponse, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .calendar_service import GoogleCalendarService, BurnoutPredictor


def calendar_login(request):
    """
    Redirect user to Google OAuth authorization.
    
    URL: /digital-twin/calendar/login/
    """
    auth_url, state = GoogleCalendarService.get_auth_url()
    request.session['oauth_state'] = state
    return HttpResponseRedirect(auth_url)


def calendar_callback(request):
    """
    Handle Google OAuth callback.
    
    URL: /digital-twin/calendar/callback/
    """
    code = request.GET.get('code')
    error = request.GET.get('error')
    
    if error:
        return JsonResponse({'error': error}, status=400)
    
    if not code:
        return JsonResponse({'error': 'No authorization code received'}, status=400)
    
    try:
        # Exchange code for tokens
        tokens = GoogleCalendarService.get_tokens_from_code(code)
        
        # In production, save tokens to user's profile
        # For now, redirect with tokens
        
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        redirect_url = f"{frontend_url}/settings?google_connected=true"
        
        return HttpResponseRedirect(redirect_url)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_tomorrows_schedule(request):
    """
    Get tomorrow's calendar events.
    
    URL: POST /digital-twin/schedule/
    
    Body:
        {
            "credentials": {...}  # Google OAuth credentials
        }
    """
    credentials = request.data.get('credentials')
    
    if not credentials:
        return Response({'error': 'Google credentials required'}, status=400)
    
    try:
        service = GoogleCalendarService(credentials)
        tomorrow = datetime.now().date() + timedelta(days=1)
        
        events = service.get_events_for_date(tomorrow)
        total_duration = sum(e['duration_minutes'] for e in events)
        
        return Response({
            'date': str(tomorrow),
            'events': events,
            'total_meetings': len(events),
            'total_duration_minutes': total_duration,
            'total_duration_hours': round(total_duration / 60, 1)
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def predict_burnout(request):
    """
    Predict burnout risk for upcoming day.
    
    URL: POST /digital-twin/predict/
    
    Body:
        {
            "credentials": {...},
            "date": "2024-01-15"  # Optional, defaults to tomorrow
        }
    """
    credentials = request.data.get('credentials')
    date_str = request.data.get('date')
    
    if not credentials:
        return Response({'error': 'Google credentials required'}, status=400)
    
    try:
        service = GoogleCalendarService(credentials)
        predictor = BurnoutPredictor()
        
        # Parse date or use tomorrow
        if date_str:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        else:
            target_date = datetime.now().date() + timedelta(days=1)
        
        # Get events
        events = service.get_events_for_date(target_date)
        
        if not events:
            return Response({
                'date': str(target_date),
                'burnout_risk': 10,  # Low risk with no meetings
                'risk_level': 'minimal',
                'message': 'No meetings scheduled'
            })
        
        # Calculate features
        total_duration = sum(e['duration_minutes'] for e in events)
        consecutive = _count_consecutive(events)
        
        features = {
            'total_meeting_duration': total_duration,
            'consecutive_meetings': consecutive,
            'days_until_deadline': 0,
            'previous_burnout_score': 50
        }
        
        # Predict
        risk_score = predictor.predict_burnout_risk(features)
        
        # Determine risk level
        if risk_score >= 85:
            risk_level = 'critical'
        elif risk_score >= 70:
            risk_level = 'high'
        elif risk_score >= 50:
            risk_level = 'moderate'
        elif risk_score >= 30:
            risk_level = 'low'
        else:
            risk_level = 'minimal'
        
        return Response({
            'date': str(target_date),
            'total_meetings': len(events),
            'total_duration_minutes': total_duration,
            'consecutive_meetings': consecutive,
            'burnout_risk': risk_score,
            'risk_level': risk_level,
            'recommendation': _get_recommendation(risk_score)
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def insert_buffer_event(request):
    """
    Manually insert a cognitive buffer event.
    
    URL: POST /digital-twin/insert-buffer/
    """
    credentials = request.data.get('credentials')
    date_str = request.data.get('date')
    
    if not credentials:
        return Response({'error': 'Google credentials required'}, status=400)
    
    try:
        service = GoogleCalendarService(credentials)
        
        # Parse date or use tomorrow
        if date_str:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        else:
            target_date = datetime.now().date() + timedelta(days=1)
        
        # Find gap
        gap = service.find_gap_for_buffer(target_date, buffer_duration=15)
        
        if not gap:
            return Response({
                'success': False,
                'message': 'No suitable gap found in schedule'
            })
        
        start_time, end_time = gap
        
        # Insert event
        event = service.insert_event(
            summary='MindAI Cognitive Buffer',
            start_time=start_time,
            end_time=end_time,
            description='🤖 Auto-inserted by MindAI. Take this time to relax and recharge.'
        )
        
        if event:
            return Response({
                'success': True,
                'event_id': event.get('id'),
                'start_time': start_time.isoformat(),
                'end_time': end_time.isoformat(),
                'event_link': event.get('htmlLink')
            })
        else:
            return Response({
                'success': False,
                'message': 'Failed to create event'
            })
            
    except Exception as e:
        return Response({'error': str(e)}, status=500)


def _count_consecutive(events):
    """Count consecutive meetings."""
    if len(events) < 2:
        return len(events)
    
    consecutive = 1
    max_consecutive = 1
    
    for i in range(len(events) - 1):
        current_end = datetime.fromisoformat(events[i]['end'].replace('Z', '+00:00'))
        next_start = datetime.fromisoformat(events[i + 1]['start'].replace('Z', '+00:00'))
        
        gap_minutes = (next_start - current_end).total_seconds() / 60
        
        if gap_minutes < 10:
            consecutive += 1
            max_consecutive = max(max_consecutive, consecutive)
        else:
            consecutive = 1
    
    return max_consecutive


def _get_recommendation(risk_score):
    """Get recommendation based on risk score."""
    if risk_score >= 85:
        return "HIGH RISK: Consider rescheduling some meetings or adding buffer time."
    elif risk_score >= 70:
        return "Moderate-high risk. Try to limit back-to-back meetings."
    elif risk_score >= 50:
        return "Moderate risk. Ensure you take breaks between meetings."
    elif risk_score >= 30:
        return "Low-moderate risk. Your schedule looks manageable."
    else:
        return "Minimal risk. Your day looks well-balanced!"
