import uuid
from django.db import models
from django.conf import settings

class Recommendation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mood_label = models.CharField(max_length=50) # Matches MoodResult.mood_label
    recommendation_text = models.TextField()
    category = models.CharField(max_length=100) # exercise, sleep, mindfulness, social, nutrition
    
    def __str__(self):
        return f"[{self.mood_label}] {self.category}: {self.recommendation_text[:20]}"

class UserActivity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=100) # sleep_hours, steps, screen_time
    value = models.FloatField()
    date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'date']),
        ]
