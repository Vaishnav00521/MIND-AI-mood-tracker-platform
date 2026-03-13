from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Sum
from survey.models import SurveyResponse
from .models import MoodResult

@receiver(post_save, sender=SurveyResponse)
def calculate_daily_mood(sender, instance, created, **kwargs):
    """
    A simple trigger to recalculate the daily mood score whenever a survey response is saved.
    For 1M+ users, this should be moved to a Celery delayed task to avoid blocking the API response.
    """
    if created:
        user = instance.user
        date = instance.date
        
        # Get all responses for the day
        daily_responses = SurveyResponse.objects.filter(user=user, date=date)
        
        positive_score = 0
        negative_score = 0
        
        for response in daily_responses:
            if response.question.question_type == 'positive':
                positive_score += response.score
            elif response.question.question_type == 'negative':
                negative_score += response.score
                
        # Algorithm: (Positive - Negative) scaled + 50 to center around 1-100
        # This is a very basic placeholder algorithm.
        base_mood_score = (positive_score - negative_score) + 50
        # bounds
        final_score = max(0, min(100, base_mood_score))
        
        # Determine Label
        label = "Neutral"
        if final_score >= 80:
            label = "Excellent"
        elif final_score >= 60:
            label = "Good"
        elif final_score >= 40:
            label = "Neutral"
        elif final_score >= 20:
            label = "Low"
        else:
            label = "Critical"

        MoodResult.objects.update_or_create(
            user=user,
            date=date,
            defaults={
                'mood_score': final_score,
                'mood_label': label
            }
        )
