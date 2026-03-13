import uuid
from django.db import models
from django.conf import settings

class MoodResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mood_results')
    date = models.DateField()
    mood_score = models.FloatField()
    mood_label = models.CharField(max_length=50) # Excellent, Good, Neutral, Low, Critical
    depression_score = models.FloatField(null=True, blank=True)
    stress_score = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'date')
        indexes = [
            models.Index(fields=['user', 'date']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.date} - {self.mood_label}"

class DailyLog(models.Model):
    """
    Core Model for Neural Data Stream Prompts
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='daily_logs')
    date = models.DateField(auto_now_add=True)
    mood_score = models.IntegerField(help_text="1-100 score")
    sleep_hours = models.FloatField(null=True, blank=True)
    journal_entry = models.TextField(blank=True, null=True, help_text="Stored as plain text here, but simulate encryption at app level")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"DailyLog {self.user.email} - {self.date}"

class DailyQuest(models.Model):
    """
    Tracks gamified habits for the Consistency Matrix & Quests
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='daily_quests')
    date = models.DateField(auto_now_add=True)
    drank_water = models.BooleanField(default=False)
    meditated = models.BooleanField(default=False)
    exercised = models.BooleanField(default=False)
    read_book = models.BooleanField(default=False)

    def __str__(self):
        return f"Quests {self.user.email} - {self.date}"

