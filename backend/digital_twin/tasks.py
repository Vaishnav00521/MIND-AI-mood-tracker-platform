"""
Celery tasks for Digital Twin Engine
"""

from celery import shared_task
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


@shared_task
def run_digital_twin_analysis(user_id):
    """
    Analyze user's calendar and predict burnout risk.
    """
    from .calendar_service import run_digital_twin_analysis as analyze
    
    return analyze(user_id)


@shared_task
def run_all_users_digital_twin():
    """
    Run digital twin analysis for all connected users.
    Called nightly at 2 AM via Celery Beat.
    """
    from users.models import CustomUser
    
    # Get all users with Google Calendar connected
    # This would filter users who have connected their Google Calendar
    users = CustomUser.objects.filter(
        google_credentials__isnull=False
    ).exclude(
        google_credentials={}
    )
    
    results = []
    
    for user in users:
        try:
            result = run_digital_twin_analysis.delay(user.id)
            results.append({
                'user_id': user.id,
                'task_id': result.id
            })
        except Exception as e:
            logger.error(f"Failed to queue analysis for user {user.id}: {e}")
            results.append({
                'user_id': user.id,
                'error': str(e)
            })
    
    return {
        'total_users': len(users),
        'queued': len(results),
        'timestamp': datetime.now().isoformat()
    }


@shared_task
def check_and_prevent_burnout(user_id, date=None):
    """
    Manual trigger for burnout check.
    """
    from .calendar_service import BurnoutPredictor, GoogleCalendarService
    
    if date is None:
        date = datetime.now().date() + timedelta(days=1)
    
    # This would get user credentials from database
    # For now, return a placeholder
    return {
        'status': 'manual_check',
        'user_id': user_id,
        'date': str(date),
        'message': 'Configure Google Calendar credentials first'
    }
