"""
Predictive Digital Twin Engine
==============================
Proactive burnout prevention via Google Calendar integration

Features:
1. Google Calendar OAuth2 integration
2. Nightly Celery task at 2 AM
3. Fetch upcoming day's events
4. Calculate meeting duration
5. Predict burnout risk using ML model
6. Auto-insert "MindAI Cognitive Buffer" if high risk
"""

import os
import pickle
from datetime import datetime, timedelta
from django.conf import settings
from django.db import models
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import logging

logger = logging.getLogger(__name__)

# Configuration
SCOPES = ['https://www.googleapis.com/auth/calendar']
TOKEN_PATH = os.path.join(settings.BASE_DIR, 'token.pickle')
CREDENTIALS_PATH = os.path.join(settings.BASE_DIR, 'credentials.json')

# Burnout prediction model path
MODEL_PATH = os.path.join(settings.BASE_DIR, 'burnout_model.pkl')


class GoogleCalendarService:
    """
    Service for Google Calendar API interactions.
    """
    
    def __init__(self, credentials_dict=None):
        """
        Initialize with Google credentials.
        
        Args:
            credentials_dict: Dictionary with Google OAuth credentials
        """
        self.credentials = None
        if credentials_dict:
            self.credentials = Credentials.from_authorized_user_info(
                credentials_dict, SCOPES
            )
        self.service = None
        
        if self.credentials:
            self.service = build('calendar', 'v3', credentials=self.credentials)
    
    @staticmethod
    def get_auth_url():
        """
        Generate OAuth URL for user authorization.
        """
        from google_auth_oauthlib.flow import Flow
        
        flow = Flow.from_client_secrets_file(
            CREDENTIALS_PATH,
            scopes=SCOPES
        )
        
        flow.redirect_uri = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:8000/calendar/callback')
        
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            prompt='consent'
        )
        
        return authorization_url, state
    
    @staticmethod
    def get_tokens_from_code(code):
        """
        Exchange authorization code for tokens.
        """
        from google_auth_oauthlib.flow import Flow
        
        flow = Flow.from_client_secrets_file(
            CREDENTIALS_PATH,
            scopes=SCOPES
        )
        
        flow.redirect_uri = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:8000/calendar/callback')
        
        flow.fetch_token(code=code)
        
        return {
            'token': flow.credentials.token,
            'refresh_token': flow.credentials.refresh_token,
            'token_uri': flow.credentials.token_uri,
            'client_id': flow.credentials.client_id,
            'client_secret': flow.credentials.client_secret,
            'scopes': flow.credentials.scopes
        }
    
    def get_events_for_date(self, date):
        """
        Fetch all events for a specific date.
        
        Args:
            date: datetime.date object
            
        Returns:
            list: List of event dictionaries
        """
        if not self.service:
            return []
        
        try:
            start_of_day = datetime.combine(date, datetime.min.time())
            end_of_day = datetime.combine(date, datetime.max.time())
            
            # Convert to RFC3339 format
            time_min = start_of_day.isoformat() + 'Z'
            time_max = end_of_day.isoformat() + 'Z'
            
            events_result = self.service.events().list(
                calendarId='primary',
                timeMin=time_min,
                timeMax=time_max,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            
            return [
                {
                    'id': e.get('id'),
                    'summary': e.get('summary', 'Untitled'),
                    'start': e['start'].get('dateTime', e['start'].get('date')),
                    'end': e['end'].get('dateTime', e['end'].get('date')),
                    'duration_minutes': self._calculate_duration(
                        e['start'].get('dateTime'),
                        e['end'].get('dateTime')
                    )
                }
                for e in events
                if e.get('summary') != 'MindAI Cognitive Buffer'  # Exclude our own events
            ]
            
        except HttpError as e:
            logger.error(f"Google Calendar API error: {e}")
            return []
    
    def _calculate_duration(self, start_dt, end_dt):
        """
        Calculate duration in minutes between two datetime strings.
        """
        if not start_dt or not end_dt:
            return 0
        
        try:
            start = datetime.fromisoformat(start_dt.replace('Z', '+00:00'))
            end = datetime.fromisoformat(end_dt.replace('Z', '+00:00'))
            return int((end - start).total_seconds() / 60)
        except:
            return 0
    
    def get_total_meeting_duration(self, date):
        """
        Get total meeting duration for a date.
        
        Args:
            date: datetime.date object
            
        Returns:
            int: Total minutes of meetings
        """
        events = self.get_events_for_date(date)
        return sum(e['duration_minutes'] for e in events)
    
    def insert_event(self, summary, start_time, end_time, description=''):
        """
        Insert a new event into the calendar.
        
        Args:
            summary: Event title
            start_time: datetime object
            end_time: datetime object
            description: Event description
            
        Returns:
            dict: Created event data or None
        """
        if not self.service:
            return None
        
        event = {
            'summary': summary,
            'description': description,
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': 'UTC',
            },
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'popup', 'minutes': 5},
                ],
            },
        }
        
        try:
            event = self.service.events().insert(
                calendarId='primary',
                body=event
            ).execute()
            
            logger.info(f"Event created: {event.get('htmlLink')}")
            return event
            
        except HttpError as e:
            logger.error(f"Error creating event: {e}")
            return None
    
    def find_gap_for_buffer(self, date, buffer_duration=15):
        """
        Find the largest gap in the schedule for a buffer event.
        
        Args:
            date: datetime.date object
            buffer_duration: Duration of buffer in minutes
            
        Returns:
            tuple: (start_time, end_time) or None
        """
        events = self.get_events_for_date(date)
        
        if not events:
            # No meetings, return morning time
            start = datetime.combine(date, datetime.min.time()) + timedelta(hours=9)
            return start, start + timedelta(minutes=buffer_duration)
        
        # Sort events by start time
        events.sort(key=lambda x: x['start'])
        
        # Find gaps
        day_start = datetime.combine(date, datetime.min.time()) + timedelta(hours=9)  # Start of workday
        day_end = datetime.combine(date, datetime.min.time()) + timedelta(hours=18)  # End of workday
        
        gaps = []
        
        # Check gap before first meeting
        first_event_start = datetime.fromisoformat(events[0]['start'].replace('Z', '+00:00'))
        if first_event_start > day_start:
            gap_duration = (first_event_start - day_start).total_seconds() / 60
            gaps.append((day_start, first_event_start, gap_duration))
        
        # Check gaps between meetings
        for i in range(len(events) - 1):
            current_end = datetime.fromisoformat(events[i]['end'].replace('Z', '+00:00'))
            next_start = datetime.fromisoformat(events[i + 1]['start'].replace('Z', '+00:00'))
            
            gap_duration = (next_start - current_end).total_seconds() / 60
            
            if gap_duration >= buffer_duration + 5:  # Need at least 5 min buffer
                gaps.append((current_end, next_start, gap_duration))
        
        # Check gap after last meeting
        last_event_end = datetime.fromisoformat(events[-1]['end'].replace('Z', '+00:00'))
        if last_event_end < day_end:
            gap_duration = (day_end - last_event_end).total_seconds() / 60
            gaps.append((last_event_end, day_end, gap_duration))
        
        if not gaps:
            return None
        
        # Return the largest gap
        largest_gap = max(gaps, key=lambda x: x[2])
        gap_start = largest_gap[0]
        gap_end = gap_start + timedelta(minutes=buffer_duration)
        
        return gap_start, gap_end


class BurnoutPredictor:
    """
    ML-based burnout prediction using Scikit-learn.
    """
    
    def __init__(self):
        """
        Initialize the model.
        """
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """
        Load pre-trained model from file.
        If file doesn't exist, create a simple default model.
        """
        try:
            if os.path.exists(MODEL_PATH):
                with open(MODEL_PATH, 'rb') as f:
                    self.model = pickle.load(f)
                logger.info("Burnout prediction model loaded")
            else:
                # Create a simple mock model for demonstration
                logger.warning("No model found, using default thresholds")
                self.model = None
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            self.model = None
    
    def predict_burnout_risk(self, features):
        """
        Predict burnout risk from features.
        
        Args:
            features: dict with:
                - total_meeting_duration: int (minutes)
                - consecutive_meetings: int
                - days_until_deadline: int
                - previous_burnout_score: int (0-100)
                
        Returns:
            int: Burnout risk score (0-100)
        """
        if self.model:
            try:
                # Use loaded model for prediction
                import numpy as np
                feature_array = np.array([[
                    features.get('total_meeting_duration', 0),
                    features.get('consecutive_meetings', 0),
                    features.get('days_until_deadline', 0),
                    features.get('previous_burnout_score', 50),
                ]])
                prediction = self.model.predict(feature_array)[0]
                return int(prediction)
            except Exception as e:
                logger.error(f"Prediction error: {e}")
        
        # Fallback: rule-based calculation
        meeting_duration = features.get('total_meeting_duration', 0)
        consecutive = features.get('consecutive_meetings', 0)
        
        # Calculate risk score
        risk_score = 0
        
        # Base score from meeting duration
        if meeting_duration > 300:  # > 5 hours
            risk_score += 50
        elif meeting_duration > 180:  # > 3 hours
            risk_score += 30
        elif meeting_duration > 120:  # > 2 hours
            risk_score += 15
        
        # Add risk from consecutive meetings
        if consecutive >= 5:
            risk_score += 35
        elif consecutive >= 3:
            risk_score += 20
        
        # Cap at 100
        return min(risk_score, 100)
    
    def create_mock_model(self):
        """
        Create a mock ML model for demonstration.
        Returns a simple sklearn-compatible model.
        """
        try:
            from sklearn.ensemble import RandomForestRegressor
            from sklearn.preprocessing import StandardScaler
            
            # Create dummy training data
            X = [
                [180, 2, 5, 40],
                [240, 3, 3, 50],
                [300, 4, 2, 60],
                [360, 5, 1, 70],
                [420, 6, 0, 80],
                [60, 1, 10, 30],
                [120, 2, 7, 35],
            ]
            y = [45, 55, 65, 75, 85, 25, 40]
            
            model = RandomForestRegressor(n_estimators=10, random_state=42)
            model.fit(X, y)
            
            # Save model
            os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
            with open(MODEL_PATH, 'wb') as f:
                pickle.dump(model, f)
            
            logger.info("Mock burnout model created and saved")
            return model
            
        except Exception as e:
            logger.error(f"Error creating mock model: {e}")
            return None


# Celery Task for nightly burnout check
def run_digital_twin_analysis(user_id):
    """
    Celery task that runs nightly to analyze calendar and prevent burnout.
    
    Workflow:
    1. Fetch user's Google Calendar credentials
    2. Get tomorrow's events
    3. Calculate total meeting duration
    4. Run burnout prediction
    5. If risk > 85%, insert buffer event
    
    Args:
        user_id: ID of the user to analyze
        
    Returns:
        dict: Analysis results
    """
    from users.models import CustomUser
    from mood_engine.models import DailyLog
    
    try:
        user = CustomUser.objects.get(id=user_id)
        
        # Get user's Google credentials (stored in user profile)
        # This would be stored in a separate model or user profile
        google_creds = getattr(user, 'google_credentials', None)
        
        if not google_creds:
            return {
                'status': 'skipped',
                'reason': 'No Google Calendar connected'
            }
        
        # Initialize services
        calendar_service = GoogleCalendarService(google_creds)
        predictor = BurnoutPredictor()
        
        # Get tomorrow's date
        tomorrow = datetime.now().date() + timedelta(days=1)
        
        # Fetch events
        events = calendar_service.get_events_for_date(tomorrow)
        
        if not events:
            return {
                'status': 'no_events',
                'date': str(tomorrow)
            }
        
        # Calculate metrics
        total_duration = sum(e['duration_minutes'] for e in events)
        consecutive_meetings = self._count_consecutive_meetings(events)
        
        # Get previous burnout score from last log
        last_log = DailyLog.objects.filter(user=user).first()
        previous_score = last_log.mood_score if last_log else 50
        
        # Predict burnout risk
        features = {
            'total_meeting_duration': total_duration,
            'consecutive_meetings': consecutive_meetings,
            'days_until_deadline': 0,
            'previous_burnout_score': previous_score
        }
        
        burnout_risk = predictor.predict_burnout_risk(features)
        
        result = {
            'status': 'analyzed',
            'date': str(tomorrow),
            'total_meetings': len(events),
            'total_duration_minutes': total_duration,
            'burnout_risk': burnout_risk,
            'buffer_inserted': False
        }
        
        # If high risk, insert buffer event
        if burnout_risk > 85:
            gap = calendar_service.find_gap_for_buffer(tomorrow, buffer_duration=15)
            
            if gap:
                start_time, end_time = gap
                
                buffer_event = calendar_service.insert_event(
                    summary='MindAI Cognitive Buffer',
                    start_time=start_time,
                    end_time=end_time,
                    description='🤖 Auto-inserted by MindAI to prevent burnout. Take this time to breathe, stretch, or grab a drink.'
                )
                
                if buffer_event:
                    result['buffer_inserted'] = True
                    result['buffer_time'] = start_time.isoformat()
                    result['buffer_link'] = buffer_event.get('htmlLink')
        
        logger.info(f"Digital twin analysis complete for user {user_id}: {result}")
        return result
        
    except Exception as e:
        logger.error(f"Digital twin analysis failed: {e}")
        return {'status': 'error', 'message': str(e)}


def _count_consecutive_meetings(events):
    """
    Count number of consecutive meetings (gaps < 10 minutes).
    """
    if len(events) < 2:
        return len(events)
    
    consecutive = 1
    max_consecutive = 1
    
    for i in range(len(events) - 1):
        current_end = datetime.fromisoformat(events[i]['end'].replace('Z', '+00:00'))
        next_start = datetime.fromisoformat(events[i + 1]['start'].replace('Z', '+00:00'))
        
        gap_minutes = (next_start - current_end).total_seconds() / 60
        
        if gap_minutes < 10:  # Less than 10 min gap = consecutive
            consecutive += 1
            max_consecutive = max(max_consecutive, consecutive)
        else:
            consecutive = 1
    
    return max_consecutive


# Celery Beat Schedule Configuration
# Add to your celery configuration:
"""
from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    'digital-twin-nightly-analysis': {
        'task': 'digital_twin.tasks.run_digital_twin_analysis',
        'schedule': crontab(hour=2, minute=0),  # Run at 2 AM daily
    },
}
"""
