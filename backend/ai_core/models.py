import uuid
from django.db import models
from django.conf import settings

class BehavioralRecommendation(models.Model):
    """
    Generated automatically by the async Celery AI pipeline based on DailyLog
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recommendations')
    title = models.CharField(max_length=200)
    description = models.TextField()
    action_type = models.CharField(max_length=50, default='General') # e.g. Sleep, Activity, Cognitive
    created_at = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Rec for {self.user.email} - {self.title}"
