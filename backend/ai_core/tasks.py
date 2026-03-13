import logging
from celery import shared_task
from django.contrib.auth import get_user_model
from .services import analyze_risk_from_data
from .models import BehavioralRecommendation

logger = logging.getLogger(__name__)
User = get_user_model()

@shared_task
def analyze_daily_risk_level(user_id, mood_score, sleep_hours):
    """
    Background Celery task to analyze risk, set flags, and generate recommendations.
    """
    try:
        user = User.objects.get(id=user_id)
        
        # 1. Run inference via ML service
        is_critical_risk = analyze_risk_from_data(mood_score, sleep_hours)
        
        # 2. Update Risk Flag
        if is_critical_risk and not user.depression_risk_flag:
            user.depression_risk_flag = True
            user.save(update_fields=['depression_risk_flag'])
        elif not is_critical_risk and user.depression_risk_flag:
            user.depression_risk_flag = False
            user.save(update_fields=['depression_risk_flag'])
            
        # 3. Generate Personalized Recommendation
        if is_critical_risk:
            BehavioralRecommendation.objects.create(
                user=user,
                title="System Alert: Deep Sleep Protocol",
                description="Your cognitive matrices show high fatigue (anxiety) correlated with recent sleep drops. Initiate 9-hour cycle tonight.",
                action_type="Sleep"
            )
        else:
            BehavioralRecommendation.objects.create(
                user=user,
                title="Nominal Subroutine: Kinetic Output",
                description="Status implies readiness for moderate physical exertion. Attempt 15-min cardiovascular activity.",
                action_type="Activity"
            )

        logger.info(f"AI Risk analysis completed for user {user.email}: Risk={is_critical_risk}")

    except User.DoesNotExist:
        logger.error(f"User {user_id} not found in analyze_daily_risk_level task")
